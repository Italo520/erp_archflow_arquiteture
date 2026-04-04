import { POST } from '@/app/api/upload/route';
import { NextRequest } from 'next/server';

jest.mock('@/auth', () => ({
    auth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } })
}));

jest.mock('@/lib/supabase', () => ({
    supabase: {
        storage: {
            from: jest.fn().mockReturnValue({
                upload: jest.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://test-url.com/image.png' } })
            })
        }
    }
}));

// Mock NextRequest and NextResponse for Jest
jest.mock('next/server', () => {
    return {
        NextResponse: {
            json: jest.fn((body, init) => {
                return {
                    status: init?.status || 200,
                    json: async () => body,
                };
            }),
        },
    };
});

describe('/api/upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_BUCKET = 'test-bucket';
    });

    it('should upload a file and return public URL', async () => {
        const formData = {
            get: (key: string) => {
                if (key === 'file') {
                    return {
                        name: 'test.png',
                        type: 'image/png',
                        arrayBuffer: async () => new Uint8Array([137, 80, 78, 71]).buffer
                    };
                }
                return null;
            }
        };

        const request = {
            formData: async () => formData,
        } as any;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('url', 'http://test-url.com/image.png');
    });

    it('should handle missing file', async () => {
        const formData = {
             get: () => null
        };
        const request = {
            formData: async () => formData,
        } as any;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toHaveProperty('error', 'No file provided');
    });
});
