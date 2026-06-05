import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea component', () => {
    it('renders correctly', () => {
        render(<Textarea placeholder="Enter multiline text" />);
        const textarea = screen.getByPlaceholderText('Enter multiline text');
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveClass('flex min-h-[60px] w-full');
    });

    it('handles onChange events', () => {
        const handleChange = jest.fn();
        render(<Textarea placeholder="Type here" onChange={handleChange} />);
        
        const textarea = screen.getByPlaceholderText('Type here');
        fireEvent.change(textarea, { target: { value: 'Multiline\nTest value' } });
        
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(textarea).toHaveValue('Multiline\nTest value');
    });

    it('can be disabled', () => {
        render(<Textarea placeholder="Disabled" disabled />);
        const textarea = screen.getByPlaceholderText('Disabled');
        expect(textarea).toBeDisabled();
        expect(textarea).toHaveClass('disabled:cursor-not-allowed disabled:opacity-50');
    });
});
