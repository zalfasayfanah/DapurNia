import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoUploader } from './PhotoUploader';

describe('PhotoUploader Component', () => {
  it('should accept image file under 5MB and call onFileSelect', () => {
    const onFileSelect = vi.fn();
    render(<PhotoUploader onFileSelect={onFileSelect} />);

    const file = new File(['dummy image content'], 'receipt.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('photo-upload-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
    expect(screen.queryByText(/Ukuran foto terlalu besar/i)).not.toBeInTheDocument();
  });

  it('should reject file exceeding 5MB with friendly error', () => {
    const onFileSelect = vi.fn();
    render(<PhotoUploader onFileSelect={onFileSelect} />);

    // 6MB file
    const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
    const largeFile = new File([largeContent], 'large-receipt.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('photo-upload-input');

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/Ukuran foto terlalu besar.*maksimal 5 MB/i)).toBeInTheDocument();
  });

  it('should reject non-image file with friendly error', () => {
    const onFileSelect = vi.fn();
    render(<PhotoUploader onFileSelect={onFileSelect} />);

    const pdfFile = new File(['pdf dummy'], 'document.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('photo-upload-input');

    fireEvent.change(input, { target: { files: [pdfFile] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/Format file harus berupa foto/i)).toBeInTheDocument();
  });
});
