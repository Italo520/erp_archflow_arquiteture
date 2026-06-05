import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton component', () => {
    it('renders correctly', () => {
        const { container } = render(<Skeleton className="w-10 h-10" />);
        const skeleton = container.firstChild as HTMLElement;
        
        expect(skeleton).toBeInTheDocument();
        expect(skeleton).toHaveClass('animate-pulse rounded-md bg-primary/10 w-10 h-10');
    });

    it('passes extra props', () => {
        const { container } = render(<Skeleton data-testid="loader" />);
        const skeleton = container.firstChild as HTMLElement;
        
        expect(skeleton).toHaveAttribute('data-testid', 'loader');
    });
});
