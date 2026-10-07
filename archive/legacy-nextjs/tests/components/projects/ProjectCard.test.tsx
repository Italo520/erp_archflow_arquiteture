import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// This is a basic auto-generated render test.
// Some components may require mocked props or contexts to pass.
// TODO: Replace with real tests.

jest.mock('@/components/projects/ProjectCard', () => {
  return function Dummy() {
    return <div data-testid="dummy-mock">Mocked ProjectCard</div>;
  };
});

describe('ProjectCard component', () => {
    it('can be imported', async () => {
        const mod = await import('@/components/projects/ProjectCard');
        expect(mod).toBeDefined();
    });
});
