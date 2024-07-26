import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Enhancer from './Enhancer';

jest.mock('axios');

describe('Enhancer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(<Enhancer />);
    expect(screen.getByText('Jewelry Enhancer Pro')).toBeInTheDocument();
  });

  test('uploads a file and sets preview', async () => {
    const file = new File(['dummy content'], 'example.jpg', { type: 'image/jpeg' });
    axios.post.mockResolvedValue({ data: 'File uploaded successfully' });

    render(<Enhancer />);

    const dropzone = screen.getByText('Drag & drop an image here, or click to select one');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByAltText('Selected')).toBeInTheDocument();
    });
  });

  test('enhances the image and displays enhanced images', async () => {
    const file = new File(['dummy content'], 'example.jpg', { type: 'image/jpeg' });
    axios.post.mockResolvedValueOnce({ data: 'File uploaded successfully' });
    axios.post.mockResolvedValueOnce({ data: ['base64Image1', 'base64Image2'] });

    render(<Enhancer />);

    const dropzone = screen.getByText('Drag & drop an image here, or click to select one');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByAltText('Selected')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Enhance Image'));

    await waitFor(() => {
      expect(screen.getByAltText('Enhanced 1')).toBeInTheDocument();
      expect(screen.getByAltText('Enhanced 2')).toBeInTheDocument();
    });
  });

  test('handles enhancement error', async () => {
    const file = new File(['dummy content'], 'example.jpg', { type: 'image/jpeg' });
    axios.post.mockResolvedValueOnce({ data: 'File uploaded successfully' });
    axios.post.mockRejectedValueOnce(new Error('Enhancement failed'));

    render(<Enhancer />);

    const dropzone = screen.getByText('Drag & drop an image here, or click to select one');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByAltText('Selected')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Enhance Image'));

    await waitFor(() => {
      expect(screen.queryByAltText('Enhanced 1')).not.toBeInTheDocument();
    });
  });
});