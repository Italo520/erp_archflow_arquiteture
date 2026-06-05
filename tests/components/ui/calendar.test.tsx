import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Calendar } from '@/components/ui/calendar';

describe('Calendar component', () => {
    it('renders correctly', () => {
        const { container } = render(<Calendar mode="single" />);
        // It should render a div with rdp (react-day-picker) class
        const calendar = container.firstChild as HTMLElement;
        expect(calendar).toBeInTheDocument();
        expect(calendar).toHaveClass('p-3');
    });
});
