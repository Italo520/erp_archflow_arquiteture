import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const TestForm = () => {
    const form = useForm({
        defaultValues: {
            username: '',
        },
    });

    return (
        <Form {...form}>
            <form>
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormDescription>This is your public display name.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};

describe('Form components', () => {
    it('renders the complete form structure correctly', () => {
        render(<TestForm />);
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('shadcn')).toBeInTheDocument();
        expect(screen.getByText('This is your public display name.')).toBeInTheDocument();
    });
});
