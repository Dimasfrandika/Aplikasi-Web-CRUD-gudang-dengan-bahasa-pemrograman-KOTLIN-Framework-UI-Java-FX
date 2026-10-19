import React, { useState, useRef, useEffect } from 'react';
import { Barang } from '../types';
import { Search, ChevronDown, Check, X, Layers, Package, AlertCircle } from 'lucide-react';

interface SearchableBarangPickerProps {
  barangList: Barang[];
  selectedBarangId: string;
  onSelectBarang: (barang: Barang) => void;
  getAvailableStock?: (barang: Barang) => number;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableBarangPicker: React.FC<SearchableBarangPickerProps> = ({
  barangList,
  selectedBarangId,
  onSelectBarang,
  getAvailableStock,
  label = 'Pilih Barang dari Master',
  placeholder = 'Ketik kode barang atau nama barang...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalCatalogOpen, setIsModalCatalogOpen] = useState(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState('Semua');
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedBarang = barangList.find(b => b.id.toString() === selectedBarangId);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter for inline dropdown (instant search by kode, nama, kategori)
  const filteredInline = barangList.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.idBarang.toLowerCase().includes(q) ||
      item.namaBarang.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q)
    );
  });

  // Filter for catalog modal
  const categories = ['Semua', ...Array.from(new Set(barangList.map(b => b.kategori || 'Umum')))];
  const filteredCatalog = barangList.filter(item => {
    const matchCat = modalCategoryFilter === 'Semua' || item.kategori === modalCategoryFilter;
    const q = modalSearchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.idBarang.toLowerCase().includes(q) ||
      item.namaBarang.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const handleSelectItem = (barang: Barang) => {
    onSelectBarang(barang);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectFromCatalog = (barang: Barang) => {
    onSelectBarang(barang);
    setIsModalCatalogOpen(false);
  };

  return (
    <div className="form-item" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{label}</label>
          <button
            type="button"
            onClick={() => setIsModalCatalogOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 4px'
            }}
            title="Buka dialog pencarian katalog dengan filter kategori"
          >
            <Layers size={13} />
            🔍 Buka Katalog Pop-up
          </button>
        </div>
      )}

      {/* Selected Item Card / Trigger Input */}
      {selectedBarang && !isOpen ? (
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1.5px solid #93c5fd',
            backgroundColor: '#f0f9ff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <span style={{
              background: '#2563eb',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap'
            }}>
              {selectedBarang.idBarang}
            </span>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                {selectedBarang.namaBarang}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                ({selectedBarang.kategori})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {getAvailableStock ? (
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: getAvailableStock(selectedBarang) <= selectedBarang.minStok ? '#d97706' : '#15803d',
                background: '#ffffff',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1'
              }}>
                Tersedia: {getAvailableStock(selectedBarang)} {selectedBarang.satuan}
              </span>
            ) : (
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e3a8a',
                background: '#e0e7ff',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Stok: {selectedBarang.stok} {selectedBarang.satuan}
              </span>
            )}
            <ChevronDown size={16} color="#64748b" />
          </div>
        </div>
      ) : (
        /* Search Box Input */
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            ref={inputRef}
            type="text"
            className="text-field"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            style={{
              paddingLeft: '36px',
              paddingRight: selectedBarang ? '64px' : '30px',
              backgroundColor: '#ffffff'
            }}
          />
          {selectedBarang && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setSearchQuery('');
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '9px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '11px',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
          )}
        </div>
      )}

      {/* Inline Search Results Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.18)',
            border: '1.5px solid #cbd5e1',
            zIndex: 80,
            maxHeight: '280px',
            overflowY: 'auto'
          }}
        >
          {/* Quick Header */}
          <div style={{
            padding: '8px 12px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b'
          }}>
            <span>Ditemukan: <strong>{filteredInline.length}</strong> barang</span>
            <span>Tekan untuk memilih barang</span>
          </div>

          {filteredInline.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              <AlertCircle size={24} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.6 }} />
              Tidak ada barang dengan kata kunci "<strong>{searchQuery}</strong>".
              <div style={{ marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalCatalogOpen(true)}
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Buka Katalog Lengkap
                </button>
              </div>
            </div>
          ) : (
            filteredInline.map((item) => {
              const isSelected = item.id.toString() === selectedBarangId;
              const stockAvailable = getAvailableStock ? getAvailableStock(item) : item.stok;
              const isOutOfStock = stockAvailable <= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    transition: 'background-color 0.12s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: '#f1f5f9',
                      color: '#1e3a8a',
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1'
                    }}>
                      {item.idBarang}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                        {item.namaBarang}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Kategori: {item.kategori} {item.keterangan ? `• ${item.keterangan}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isOutOfStock ? '#dc2626' : stockAvailable <= item.minStok ? '#d97706' : '#15803d',
                      background: isOutOfStock ? '#fee2e2' : stockAvailable <= item.minStok ? '#fef3c7' : '#dcfce7',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {stockAvailable} {item.satuan}
                    </span>
                    {isSelected && <Check size={16} color="#2563eb" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* POP-UP CATALOG DIALOG FOR HUNDREDS OF ITEMS */}
      {isModalCatalogOpen && (
        <div className="modal-overlay" onClick={() => setIsModalCatalogOpen(false)} style={{ zIndex: 110 }}>
          <div
            className="alert-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '850px',
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={22} color="#2563eb" />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Pencarian & Pemilihan Barang Gudang</h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Pilih barang dari katalog dengan filter kategori dan pencarian instan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalCatalogOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Toolbar inside Modal */}
            <div className="picker-modal-filter-grid">
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Cari kode, nama barang, atau spesifikasi..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="text-field"
                  autoFocus
                  style={{ paddingLeft: '36px', width: '100%' }}
                />
              </div>

              <select
                value={modalCategoryFilter}
                onChange={(e) => setModalCategoryFilter(e.target.value)}
                className="select-field"
                style={{ width: '100%' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Items Table in Modal */}
            <div className="table-container" style={{ flex: 1, maxHeight: '420px', overflowY: 'auto' }}>
              <table className="barang-table">
                <thead>
                  <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc' }}>
                    <th style={{ width: '40px' }}>No</th>
                    <th style={{ width: '120px' }}>Kode</th>
                    <th>Nama Barang</th>
                    <th style={{ width: '150px' }}>Kategori</th>
                    <th style={{ width: '120px' }}>Stok Tersedia</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCatalog.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                        Tidak ada barang yang cocok dengan filter atau kata kunci pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredCatalog.map((item, idx) => {
                      const stockAvailable = getAvailableStock ? getAvailableStock(item) : item.stok;
                      const isSelected = item.id.toString() === selectedBarangId;

                      return (
                        <tr
                          key={item.id}
                          className={isSelected ? 'selected' : ''}
                          onClick={() => handleSelectFromCatalog(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 700 }}>{item.idBarang}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.namaBarang}</div>
                            {item.keterangan && (
                              <div style={{ fontSize: '11px', color: isSelected ? '#ffffff' : '#64748b' }}>
                                {item.keterangan}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge-kategori">{item.kategori}</span>
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            <span style={{
                              color: stockAvailable === 0 ? '#dc2626' : stockAvailable <= item.minStok ? '#d97706' : '#15803d'
                            }}>
                              {stockAvailable} {item.satuan}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectFromCatalog(item);
                              }}
                              style={{ padding: '4px 12px', fontSize: '11px' }}
                            >
                              Pilih
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
              <span>Menampilkan {filteredCatalog.length} dari {barangList.length} total barang</span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalCatalogOpen(false)}
                style={{ padding: '6px 16px', fontSize: '12px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
