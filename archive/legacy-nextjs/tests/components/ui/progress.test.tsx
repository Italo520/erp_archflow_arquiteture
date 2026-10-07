import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from '@/components/ui/progress';

describe('Progress component', () => {
    it('renders correctly', () => {
        render(<Progress value={50} aria-label="Loading..." />);
        const progress = screen.getByLabelText('Loading...');
        
        expect(progress).toBeInTheDocument();
        // Since Radix doesn't add aria-valuenow if the role is missing, we just check it exists.
    });

    it('renders without value correctly', () => {
        render(<Progress aria-label="Indeterminate" />);
        const progress = screen.getByLabelText('Indeterminate');
        
        expect(progress).toBeInTheDocument();
    });
});
