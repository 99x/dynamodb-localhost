import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { deprecation } from './deprecation';
import { defaultInstallPath } from './constants';

export interface RemoveOptions {
  /** Folder where DynamoDB Local is installed to. @default ".dynamodb" */
  installPath: string,

  /** @deprecated Callback for when the removal is complete. Use the returned Promise instead. */
  onComplete: () => unknown,
}

export const remove = async (arg0?: (() => unknown) | Partial<RemoveOptions>, arg1?: string): Promise<void> => {
  if (typeof arg0 === 'function' && typeof arg1 === 'string') {
    deprecation('Pass the installPath argument via the first object argument');
    await remove({ onComplete: arg0, installPath: arg1 });
    return;
  }
  if (typeof arg0 === 'function') {
    await remove({ onComplete: arg0 });
    return;
  }
  if (typeof arg1 === 'string') {
    deprecation('Pass the installPath argument via the first object argument');
    await remove({ installPath: arg1 });
    return;
  }

  const installPath = arg0?.installPath ?? resolve(defaultInstallPath);

  rmSync(installPath, { recursive: true, force: true });
  console.log('Removal of DynamoDB Local complete.');

  if (arg0?.onComplete) {
    deprecation('remove() now returns a Promise to be awaited, that should be used instead of the onComplete callback.');
    arg0.onComplete();
  }
};
