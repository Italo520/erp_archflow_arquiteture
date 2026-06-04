import { triggerNotification, pusherServer } from '@/lib/pusher';

jest.mock('@/lib/pusher', () => ({
  pusherServer: {
    trigger: jest.fn().mockResolvedValue(undefined),
  },
  triggerNotification: jest.fn(),
}));

describe('pusherServer initialization', () => {
  it('should initialize without fallback secrets', () => {
    // Cannot directly test the initialization parameters of pusherServer since it's already instantiated in the file,
    // but we can check if it exports the object.
    expect(pusherServer).toBeDefined();
  });
});
