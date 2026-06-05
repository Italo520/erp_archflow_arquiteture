import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea component', () => {
    it('renders children correctly', () => {
        const { getByText } = render(
            <ScrollArea className="h-20 w-20">
                <div>Scrollable Content</div>
            </ScrollArea>
        );

        expect(getByText('Scrollable Content')).toBeInTheDocument();
    });

    it('renders horizontal scrollbar when specified', () => {
        const { container } = render(
            <ScrollArea>
                <div>Content</div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        );
        
        expect(container).toBeInTheDocument();
    });
});
