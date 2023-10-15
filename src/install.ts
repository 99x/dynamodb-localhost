import { get } from 'node:https';
import { createUnzip } from 'node:zlib';
import { extract } from 'tar';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { deprecation } from './deprecation';
import { downloadUrl, jarFilename, defaultInstallPath } from './constants';

export interface InstallOptions {
  /** Folder where DynamoDB Local is installed to. @default ".dynamodb" */
  installPath: string,

  /** @deprecated Callback for when the installation is complete. Use the returned Promise instead. */
  onComplete: () => unknown,
}

export const install = async (arg0?: (() => unknown) | Partial<InstallOptions>, arg1?: string): Promise<void> => {
  if (typeof arg0 === 'function' && typeof arg1 === 'string') {
    deprecation('Pass the installPath argument via the first object argument');
    await install({ onComplete: arg0, installPath: arg1 });
    return;
  }
  if (typeof arg0 === 'function') {
    await install({ onComplete: arg0 });
    return;
  }
  if (typeof arg1 === 'string') {
    deprecation('Pass the installPath argument via the first object argument');
    await install({ installPath: arg1 });
    return;
  }

  const installPath = arg0?.installPath ?? resolve(defaultInstallPath);

  if (!existsSync(join(installPath, jarFilename))) {
    console.log(`Installing DynamoDB Local from ${downloadUrl}...`);
    await downloadTarGz(downloadUrl, installPath);
    console.log('Installation of DynamoDB Local complete.');
  }

  if (arg0?.onComplete) {
    deprecation('install() now returns a Promise to be awaited, that should be used instead of the onComplete callback.');
    arg0.onComplete();
  }
};

const downloadTarGz = (url: string, destinationDirectory: string) => {
  return new Promise<void>((res) => {
    mkdirSync(destinationDirectory, { recursive: true });
    get(url, (response) => {
      if (response.statusCode !== 200) {
        throw new Error(`Got status code ${response.statusCode} when attempting to download from ${url}`);
      }

      response
        .pipe(createUnzip())
        .pipe(
          extract({
            cwd: destinationDirectory,
          }),
        )
        .on('end', () => {
          res();
        })
        .on('error', (err) => {
          throw new Error(`Error while downloading: ${err}`);
        });
    })
      .on('error', (err) => {
        throw new Error(`Error while downloading: ${err}`);
      });
  });
};
