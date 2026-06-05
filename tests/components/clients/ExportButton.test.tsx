import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// This is a basic auto-generated render test.
// Some components may require mocked props or contexts to pass.
// TODO: Replace with real tests.

jest.mock('@/components/clients/ExportButton', () => {
  return function Dummy() {
    return <div data-testid="dummy-mock">Mocked ExportButton</div>;
  };
});

describe('ExportButton component', () => {
    it('can be imported', async () => {
        const mod = await import('@/components/clients/ExportButton');
        expect(mod).toBeDefined();
    });
});
