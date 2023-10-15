import { instances } from './instances';

export const stop = async (port: number): Promise<void> => {
  const instance = instances.get(port);
  if (!instance) {
    throw new Error(`No managed DynamoDB instance on port ${port}`);
  }

  instance.process.kill('SIGKILL');
  instances.delete(port);
};
