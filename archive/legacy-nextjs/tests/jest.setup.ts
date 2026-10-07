import { TextEncoder, TextDecoder } from 'util';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

Object.assign(global, { TextDecoder, TextEncoder });

import '@testing-library/jest-dom';

// Global mocks for Next.js actions
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));


jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}));

jest.mock("next-auth/react", () => ({
    useSession: () => ({ data: { user: { name: "Test User" } }, status: "authenticated" }),
    signOut: jest.fn(),
}));

jest.mock("@/auth", () => ({
    auth: jest.fn(),
    handlers: { GET: jest.fn(), POST: jest.fn() },
    signIn: jest.fn(),
    signOut: jest.fn(),
}));

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = ResizeObserver;

if (typeof window !== 'undefined') {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    window.HTMLElement.prototype.hasPointerCapture = jest.fn();
    window.HTMLElement.prototype.releasePointerCapture = jest.fn();
}

if (typeof window !== 'undefined' && !window.PointerEvent) {
    class PointerEvent extends Event {
        pointerId: number;
        constructor(type: string, props: PointerEventInit = {}) {
            super(type, props);
            this.pointerId = props.pointerId || 0;
        }
    }
    window.PointerEvent = PointerEvent as any;
}
