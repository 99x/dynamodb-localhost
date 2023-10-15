import { expect, test, vi } from 'vitest';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { install } from './install';
import { jarFilename } from './constants';
import { prepTmpDir, tmpDir } from './helpers.test';

test('should install DynamoDB Local: old style', async () => {
  // Given
  const path = resolve(tmpDir, 'install-old');
  prepTmpDir(path);
  const callback = vi.fn();

  // When
  await install(callback, path);

  // Then...
  // the DynamoDB Local binary was installed at the custom path
  expect(existsSync(join(path, jarFilename))).toBe(true);
  // and the callback fired
  expect(callback).toBeCalledTimes(1);
});

test('should install DynamoDB Local: new style', async () => {
  // Given
  const path = resolve(tmpDir, 'install-new');
  prepTmpDir(path);
  const callback = vi.fn();

  // When
  await install({ installPath: path, onComplete: callback });

  // Then...
  // the DynamoDB Local binary was installed at the custom path
  expect(existsSync(join(path, jarFilename))).toBe(true);
  // and the callback fired
  expect(callback).toBeCalledTimes(1);
});
