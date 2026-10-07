import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox component', () => {
    it('renders correctly', () => {
        render(<Checkbox aria-label="Test checkbox" />);
        const checkbox = screen.getByRole('checkbox', { name: /test checkbox/i });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toHaveClass('peer h-4 w-4 shrink-0 rounded-sm border');
    });

    it('can be checked', () => {
        const onCheckedChange = jest.fn();
        render(<Checkbox aria-label="Test checkbox" onCheckedChange={onCheckedChange} />);
        
        const checkbox = screen.getByRole('checkbox', { name: /test checkbox/i });
        fireEvent.click(checkbox);
        
        expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('can be disabled', () => {
        render(<Checkbox aria-label="Disabled checkbox" disabled />);
        const checkbox = screen.getByRole('checkbox', { name: /disabled checkbox/i });
        
        expect(checkbox).toBeDisabled();
        expect(checkbox).toHaveClass('disabled:cursor-not-allowed disabled:opacity-50');
    });
});
