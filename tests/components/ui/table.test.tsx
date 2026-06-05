import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from '@/components/ui/table';

describe('Table components', () => {
    it('renders the complete table structure', () => {
        render(
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Header 1</TableHead>
                        <TableHead>Header 2</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Cell 1</TableCell>
                        <TableCell>Cell 2</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Footer 1</TableCell>
                        <TableCell>Footer 2</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Header 1')).toBeInTheDocument();
        expect(screen.getByText('Cell 1')).toBeInTheDocument();
        expect(screen.getByText('Footer 1')).toBeInTheDocument();
    });
});
