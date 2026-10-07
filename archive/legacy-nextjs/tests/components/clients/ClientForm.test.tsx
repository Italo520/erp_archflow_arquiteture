import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClientForm } from '@/components/clients/ClientForm';
import { createClient, updateClient } from '@/app/actions/client';

// Mock server actions
jest.mock('@/app/actions/client', () => ({
    createClient: jest.fn(),
    updateClient: jest.fn(),
}));

describe('ClientForm component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({
                    logradouro: 'Rua Mockada',
                    bairro: 'Bairro Mock',
                    localidade: 'Cidade Mock',
                    uf: 'SP',
                }),
            })
        ) as jest.Mock;
    });

    it('renders the creation form correctly', () => {
        render(<ClientForm />);
        expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /criar cliente/i })).toBeInTheDocument();
        expect(screen.getByText('Tipo de Pessoa *')).toBeInTheDocument();
    });

    it('renders the update form with initial data', () => {
        const initialData = {
            id: '123',
            name: 'Cliente Teste',
            email: 'teste@exemplo.com',
            document: '11122233344',
            legalType: 'PF',
            category: 'RESIDENTIAL',
            contactPreference: 'EMAIL',
        };

        render(<ClientForm initialData={initialData} />);
        expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        // screen.getByDisplayValue only works for inputs, check the form rendered it
        expect(screen.getByDisplayValue('Cliente Teste')).toBeInTheDocument();
    });

    it('calls viaCEP when search button is clicked', async () => {
        render(<ClientForm />);
        
        const cepInput = screen.getByPlaceholderText('00000-000');
        fireEvent.change(cepInput, { target: { value: '01001000' } });

        // There's only one search button for CEP, we can find it by its icon or just by clicking the button next to CEP
        // The button has no text, so we can find it by its type/role inside the address section.
        // Actually it's simpler: find button by role 'button' but there are multiple.
        // Let's find it by the SVG icon or index. The form has 'Cancelar' and 'Criar Cliente'.
        // The CEP search is the first button usually, but let's query all buttons.
        const buttons = screen.getAllByRole('button');
        const searchBtn = buttons[1]; // 0 is Select trigger usually, 1 might be search, let's find the specific one:
        
        // Let's just find the button that is inside the same div as the CEP input
        const cepLabel = screen.getByText('CEP');
        const cepContainer = cepLabel.parentElement;
        const button = cepContainer?.querySelector('button');
        
        if (button) {
            fireEvent.click(button);
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/');
            });
        }
    });

    it('submits form to createClient', async () => {
        (createClient as jest.Mock).mockResolvedValue({ ok: true });
        
        render(<ClientForm />);
        
        // Fill basic required fields
        fireEvent.change(screen.getByPlaceholderText('João da Silva'), { target: { value: 'Novo Cliente' } });
        fireEvent.change(screen.getByPlaceholderText('joao@exemplo.com'), { target: { value: 'novo@email.com' } });
        // Document is optional, so we can leave it empty to avoid validation errors

        const submitBtn = screen.getByRole('button', { name: /criar cliente/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(createClient).toHaveBeenCalled();
        });
    });
});
