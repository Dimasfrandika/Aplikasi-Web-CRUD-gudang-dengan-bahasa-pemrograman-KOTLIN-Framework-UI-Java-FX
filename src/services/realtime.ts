/**
 * Real-time WebSocket synchronization service for Sistem Manajemen Gudang.
 * Connects to the Express backend WebSocket endpoint (/api/ws) and listens for
 * database updates (CRUD master barang, transaksi masuk, transaksi keluar, pengaturan).
 */

export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected';

export interface RealtimeChangeEvent {
  type: 'DATA_CHANGED';
  entity: 'barang' | 'transaksi_masuk' | 'transaksi_keluar' | 'pengaturan' | 'users';
  action: string;
  data?: any;
  timestamp: number;
}

type EventListener = (event: RealtimeChangeEvent) => void;
type StatusListener = (status: RealtimeStatus) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private status: RealtimeStatus = 'disconnected';
  private eventListeners: Set<EventListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private pollInterval: any = null;
  private isDestroyed = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
      // Listen for tab focus or visibility changes to trigger sync
      window.addEventListener('focus', () => {
        this.notifyListeners({
          type: 'DATA_CHANGED',
          entity: 'barang',
          action: 'tab_focus',
          timestamp: Date.now()
        });
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.notifyListeners({
            type: 'DATA_CHANGED',
            entity: 'barang',
            action: 'tab_visible',
            timestamp: Date.now()
          });
        }
      });

      // Cross-tab sync for same browser
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('gudang_')) {
          this.notifyListeners({
            type: 'DATA_CHANGED',
            entity: 'barang',
            action: 'storage_event',
            timestamp: Date.now()
          });
        }
      });
    }
  }

  private setStatus(newStatus: RealtimeStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      for (const listener of this.statusListeners) {
        try {
          listener(newStatus);
        } catch (e) {
          console.error('Error in status listener:', e);
        }
      }
    }
  }

  public getStatus(): RealtimeStatus {
    return this.status;
  }

  public init() {
    if (this.isDestroyed) return;
    this.connect();

    // Infallible polling fallback every 6 seconds to ensure data is always fresh across browsers
    if (!this.pollInterval) {
      this.pollInterval = setInterval(() => {
        this.notifyListeners({
          type: 'DATA_CHANGED',
          entity: 'barang',
          action: 'poll_sync',
          timestamp: Date.now()
        });
      }, 6000);
    }
  }

  private connect() {
    if (this.isDestroyed || typeof window === 'undefined') return;

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    this.setStatus('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;

      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      socket.onopen = () => {
        if (this.ws !== socket) return;
        this.setStatus('connected');

        // Setup ping every 20 seconds
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 20000);

        // Immediately trigger sync on successful connection
        this.notifyListeners({
          type: 'DATA_CHANGED',
          entity: 'barang',
          action: 'connect_sync',
          timestamp: Date.now()
        });
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'DATA_CHANGED') {
            this.notifyListeners(data as RealtimeChangeEvent);
          }
        } catch (e) {
          console.warn('Error parsing incoming WS message:', e);
        }
      };

      socket.onclose = () => {
        if (this.ws !== socket) return;
        this.setStatus('disconnected');
        this.cleanupPing();
        this.scheduleReconnect();
      };

      socket.onerror = () => {
        if (this.ws !== socket) return;
        this.setStatus('disconnected');
        try {
          socket.close();
        } catch {
          // ignore
        }
      };
    } catch (e) {
      console.warn('WebSocket connection attempt error:', e);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  private cleanupPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    // Reconnect in 3 seconds
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  private notifyListeners(event: RealtimeChangeEvent) {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (e) {
        console.error('Realtime listener error:', e);
      }
    }
  }

  public subscribe(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public forceSync() {
    this.notifyListeners({
      type: 'DATA_CHANGED',
      entity: 'barang',
      action: 'manual_force_sync',
      timestamp: Date.now()
    });
  }

  public destroy() {
    this.isDestroyed = true;
    this.cleanupPing();
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }
    this.eventListeners.clear();
    this.statusListeners.clear();
  }
}

export const realtimeService = new RealtimeService();
