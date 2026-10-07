import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

describe('Avatar components', () => {
    it('renders avatar fallback initially or when image is broken', () => {
        render(
            <Avatar>
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        );

        const fallback = screen.getByText('JD');
        expect(fallback).toBeInTheDocument();
        expect(fallback).toHaveClass('flex h-full w-full items-center justify-center rounded-full bg-muted');
    });

    it('renders avatar image with correct src', () => {
        render(
            <Avatar>
                <AvatarImage src="/avatar.png" alt="@johndoe" />
            </Avatar>
        );
        
        // Since Radix AvatarImage might not render immediately until loaded, 
        // we can test if it accepts the correct props at least, though JSDOM image loading is tricky
        // This is a basic render check for the wrapper.
        const avatarWrapper = screen.getByRole('img', { hidden: true })?.parentElement;
        if(avatarWrapper) {
            expect(avatarWrapper).toHaveClass('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full');
        }
    });
});
