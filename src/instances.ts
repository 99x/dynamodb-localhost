import type { ChildProcess } from 'node:child_process';
import type { StartOptions } from './start';

interface InstanceDefinition {
  options: Partial<StartOptions> | undefined,
  process: ChildProcess,
}

export const instances: Map<number, InstanceDefinition> = new Map();
