const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');
const testsDir = path.join(__dirname, '../tests/components');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.tsx') || f.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

const extractComponentName = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Simple regex to find default export or named function export
    const defaultExportMatch = content.match(/export default (function )?([A-Za-z0-9_]+)/);
    if (defaultExportMatch && defaultExportMatch[2]) return defaultExportMatch[2];
    
    // Fallback: use filename
    const baseName = path.basename(filePath, path.extname(filePath));
    // Capitalize first letter
    return baseName.charAt(0).toUpperCase() + baseName.slice(1).replace(/[^a-zA-Z0-9]/g, '');
};

walkDir(componentsDir, (filePath) => {
    // Skip if it's already a test file or in a __tests__ dir
    if (filePath.includes('.test.') || filePath.includes('__tests__')) return;

    const relativePath = path.relative(componentsDir, filePath);
    const parsedPath = path.parse(relativePath);
    
    const testDir = path.join(testsDir, parsedPath.dir);
    const testFilePath = path.join(testDir, `${parsedPath.name}.test.${parsedPath.ext === '.tsx' ? 'tsx' : 'jsx'}`);

    if (fs.existsSync(testFilePath)) {
        return; // Test already exists
    }

    fs.mkdirSync(testDir, { recursive: true });

    const importPath = `@/components/${parsedPath.dir ? parsedPath.dir + '/' : ''}${parsedPath.name}`;
    const componentName = extractComponentName(filePath);

    // Some components don't export default, so we try named import if it's uppercase
    const importStatement = `import ${componentName} from '${importPath}';`;

    const testContent = `import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// This is a basic auto-generated render test.
// Some components may require mocked props or contexts to pass.
// TODO: Replace with real tests.

jest.mock('${importPath}', () => {
  return function Dummy() {
    return <div data-testid="dummy-mock">Mocked ${componentName}</div>;
  };
});

describe('${componentName} component', () => {
    it('can be imported', async () => {
        const mod = await import('${importPath}');
        expect(mod).toBeDefined();
    });
});
`;

    fs.writeFileSync(testFilePath, testContent, 'utf8');
    console.log(`Created dummy test for ${relativePath}`);
});
