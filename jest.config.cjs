module.exports = {
  testEnvironment: 'node',
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json', 'html'],
  collectCoverageFrom: [
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/utils/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ]
};
