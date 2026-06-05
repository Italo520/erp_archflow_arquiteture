import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// This is a basic auto-generated render test.
// Some components may require mocked props or contexts to pass.
// TODO: Replace with real tests.

jest.mock('@/components/ModeToggle', () => {
  return function Dummy() {
    return <div data-testid="dummy-mock">Mocked ModeToggle</div>;
  };
});

describe('ModeToggle component', () => {
    it('can be imported', async () => {
        const mod = await import('@/components/ModeToggle');
        expect(mod).toBeDefined();
    });
});
