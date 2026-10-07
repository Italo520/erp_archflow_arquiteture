import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

describe('Input component', () => {
    it('renders correctly', () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
        expect(input).toHaveClass('flex h-10 w-full');
    });

    it('handles onChange events', () => {
        const handleChange = jest.fn();
        render(<Input placeholder="Type here" onChange={handleChange} />);
        
        const input = screen.getByPlaceholderText('Type here');
        fireEvent.change(input, { target: { value: 'Test value' } });
        
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(input).toHaveValue('Test value');
    });

    it('can be disabled', () => {
        render(<Input placeholder="Disabled" disabled />);
        const input = screen.getByPlaceholderText('Disabled');
        expect(input).toBeDisabled();
        expect(input).toHaveClass('disabled:cursor-not-allowed disabled:opacity-50');
    });

    it('forwards refs correctly', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<Input ref={ref} placeholder="With ref" />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
});
