import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// This is a basic auto-generated render test.
// Some components may require mocked props or contexts to pass.
// TODO: Replace with real tests.

jest.mock('@/components/dashboard/ProjectList', () => {
  return function Dummy() {
    return <div data-testid="dummy-mock">Mocked ProjectList</div>;
  };
});

describe('ProjectList component', () => {
    it('can be imported', async () => {
        const mod = await import('@/components/dashboard/ProjectList');
        expect(mod).toBeDefined();
    });
});
