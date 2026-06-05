import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Label } from '@/components/ui/label';

describe('Label component', () => {
    it('renders correctly', () => {
        render(<Label htmlFor="test-input">Test Label</Label>);
        const label = screen.getByText('Test Label');
        expect(label).toBeInTheDocument();
        expect(label).toHaveClass('text-sm font-medium leading-none');
    });

    it('handles peer-disabled state classes', () => {
        // Just checking if the classes exist in the variant configuration
        render(<Label className="peer-disabled:cursor-not-allowed">Test Label</Label>);
        const label = screen.getByText('Test Label');
        expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
    });
});
