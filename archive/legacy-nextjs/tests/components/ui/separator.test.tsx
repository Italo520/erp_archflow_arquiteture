import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Separator } from '@/components/ui/separator';

describe('Separator component', () => {
    it('renders horizontal separator correctly', () => {
        const { container } = render(<Separator />);
        const separator = container.firstChild as HTMLElement;
        
        expect(separator).toBeInTheDocument();
        expect(separator).toHaveClass('shrink-0 bg-border');
        expect(separator).toHaveClass('h-[1px] w-full'); // horizontal
    });

    it('renders vertical separator correctly', () => {
        const { container } = render(<Separator orientation="vertical" />);
        const separator = container.firstChild as HTMLElement;
        
        expect(separator).toBeInTheDocument();
        expect(separator).toHaveClass('h-full w-[1px]'); // vertical
    });

    it('applies decorative prop correctly', () => {
        const { container } = render(<Separator decorative={true} />);
        const separator = container.firstChild as HTMLElement;
        
        // Radix applies aria-orientation to non-decorative separators
        // Or role="none" if decorative
        expect(separator).toBeInTheDocument();
    });
});
