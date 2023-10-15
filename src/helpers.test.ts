import { describe, expect } from 'vitest';
import { join } from 'node:path';
import { existsSync, rmSync } from 'node:fs';
import { jarFilename } from './constants';

export const tmpDir = join(__dirname, '..', 'tmp');

export const prepTmpDir = (path: string) => {
  rmSync(path, { force: true, recursive: true });
  expect(existsSync(join(path, jarFilename))).toBe(false);
};

describe.skip('helpers');
