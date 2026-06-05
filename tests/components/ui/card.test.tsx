import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card components', () => {
    it('renders the complete card structure', () => {
        render(
            <Card data-testid="card">
                <CardHeader data-testid="card-header">
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent data-testid="card-content">
                    <p>Card content text</p>
                </CardContent>
                <CardFooter data-testid="card-footer">
                    <button>Footer Button</button>
                </CardFooter>
            </Card>
        );

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByTestId('card-header')).toBeInTheDocument();
        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card Description')).toBeInTheDocument();
        expect(screen.getByTestId('card-content')).toBeInTheDocument();
        expect(screen.getByText('Card content text')).toBeInTheDocument();
        expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    });

    it('Card applies correct classes', () => {
        render(<Card data-testid="card-element" className="custom-class" />);
        const card = screen.getByTestId('card-element');
        expect(card).toHaveClass('rounded-xl border border-border bg-card text-card-foreground shadow-card transition-shadow duration-200 custom-class');
    });
});
