import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '@/components/ui/badge';

describe('Badge component', () => {
    it('renders correctly with default props', () => {
        render(<Badge>Test Badge</Badge>);
        const badge = screen.getByText('Test Badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-primary/15');
    });

    it('renders different variants correctly', () => {
        const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
        let badge = screen.getByText('Secondary');
        expect(badge).toHaveClass('bg-secondary');

        rerender(<Badge variant="destructive">Destructive</Badge>);
        badge = screen.getByText('Destructive');
        expect(badge).toHaveClass('bg-destructive/10');

        rerender(<Badge variant="outline">Outline</Badge>);
        badge = screen.getByText('Outline');
        expect(badge).toHaveClass('text-foreground');
    });

    it('passes extra props to the root element', () => {
        render(<Badge data-testid="custom-badge" id="my-badge">Custom</Badge>);
        const badge = screen.getByTestId('custom-badge');
        expect(badge).toHaveAttribute('id', 'my-badge');
    });
});
