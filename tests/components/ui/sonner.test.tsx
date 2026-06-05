import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

// Mock matchMedia to prevent sonner/radix from failing in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Sonner component (Toaster)', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <ThemeProvider>
                <Toaster />
            </ThemeProvider>
        );
        expect(container).toBeInTheDocument();
    });
});
