import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

describe('Button component', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-primary'); // Default variant
    });

    it('renders different variants correctly', () => {
        const { rerender } = render(<Button variant="destructive">Destructive</Button>);
        let button = screen.getByRole('button', { name: /destructive/i });
        expect(button).toHaveClass('bg-destructive');

        rerender(<Button variant="outline">Outline</Button>);
        button = screen.getByRole('button', { name: /outline/i });
        expect(button).toHaveClass('border-border');
    });

    it('handles click events', () => {
        const onClickMock = jest.fn();
        render(<Button onClick={onClickMock}>Click</Button>);
        
        const button = screen.getByRole('button', { name: /click/i });
        fireEvent.click(button);
        
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button', { name: /disabled/i });
        
        expect(button).toBeDisabled();
        expect(button).toHaveClass('disabled:opacity-50');
    });

    it('renders as a child element when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );
        
        const link = screen.getByRole('link', { name: /link button/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/test');
        expect(link).toHaveClass('inline-flex'); // Should still inherit button classes
    });
});
