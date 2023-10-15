import { deprecation } from './deprecation';
import { instances } from './instances';
import { start } from './start';
import { stop } from './stop';

/** @deprecated */
export const restart = async (port: number): Promise<void> => {
  deprecation('restart() is no longer supported. Use stop() and start() instead.');

  const instance = instances.get(port);
  if (!instance) {
    throw new Error(`No managed DynamoDB instance on port ${port}`);
  }
  stop(port);
  start(instance.options);
};
