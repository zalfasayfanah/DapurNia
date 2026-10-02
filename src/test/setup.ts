import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  window.URL.createObjectURL = (blob: Blob) => `mock-url://${blob.size}`;
  window.URL.revokeObjectURL = () => {};
}
