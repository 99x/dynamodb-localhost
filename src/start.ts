import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { env } from 'node:process';
import { get } from 'node:http';
import { setTimeout } from 'node:timers/promises';
import { jarFilename, defaultInstallPath } from './constants';
import { deprecation } from './deprecation';
import { instances } from './instances';

export interface StartOptions {
  /** Port to listen on. @default 8000 */
  port: number,

  /** Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated "allow" list of specific domains. @default "*", which allows public access. */
  cors: string,

  /** Whether to run in memory, instead of using a database file. When you stop DynamoDB none of the data will be saved. Note that you cannot specify both dbPath and inMemory at once. @default true */
  inMemory: boolean,

  /** The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both dbPath and inMemory at once. For the path, current working directory is <projectroot>/node_modules/aws-dynamodb-local/dynamodb. For example to create <projectroot>/node_modules/aws-dynamodb-local/dynamodb/<mypath> you should specify '<mypath>/' with a forward slash at the end. @default undefined */
  dbPath: string | undefined,

  /** DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration. @default true */
  sharedDb: boolean,

  /** Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status.) @default true */
  delayTransientStatuses: boolean,

  /** Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter. @default true */
  optimizeDbBeforeStartup: boolean,

  /** Prints a usage summary and options. */
  help: boolean,

  /** A string which sets the initial heap size e.g. '2G'. This is input to the java -Xms argument. @default undefined */
  heapInitial: string | undefined,

  /** A string which sets the maximum heap size e.g. '4G'. This is input to the java -Xmx argument. @default undefined */
  heapMax: string | undefined,

  /** Run DynamoDB inside docker container instead of as a local Java program. @default false */
  docker: boolean,

  /** If docker enabled, custom docker path to use. @default "docker" */
  dockerPath: string,

  /** If docker enabled, docker image to run. @default "amazon/dynamodb-local" */
  dockerImage: string,

  /** Folder where DynamoDB Local is installed to. @default ".dynamodb" */
  installPath: string,

  /** @deprecated Alias for installPath */
  install_path: string | undefined,
}

const defaultOptions: StartOptions = {
  port: 8000,
  cors: '*',
  inMemory: true,
  dbPath: undefined,
  sharedDb: true,
  delayTransientStatuses: true,
  optimizeDbBeforeStartup: true,
  help: false,
  heapInitial: undefined,
  heapMax: undefined,
  docker: false,
  dockerPath: 'docker',
  dockerImage: 'amazon/dynamodb-local',
  installPath: defaultInstallPath,
  install_path: undefined,
};

export const start = async (customOptions?: Partial<StartOptions>): Promise<void> => {
  const options = { ...defaultOptions, ...customOptions };

  if (options.inMemory && options.dbPath) {
    deprecation('Both inMemory set to true and dbPath specified, representing undefined behavior. You should either not specify dbPath, or set inMemory to false. Future versions may throw an error.');
  }

  if (instances.get(options.port)) {
    throw new Error(`DynamoDB Local instance already running on port ${options.port}`);
  }

  const jvmArgs: string[] = [];
  // See https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html#DynamoDBLocal.CommandLineOptions
  const dynamoDbArgs: string[] = [];

  if (options.heapInitial) {
    jvmArgs.push(`-Xms${options.heapInitial}`);
  }
  if (options.heapMax) {
    jvmArgs.push(`-Xmx${options.heapMax}`);
  }
  if (options.dbPath) {
    dynamoDbArgs.push('-dbPath', options.dbPath);
  } else {
    dynamoDbArgs.push('-inMemory');
  }
  if (options.sharedDb) {
    dynamoDbArgs.push('-sharedDb');
  }
  if (options.cors) {
    dynamoDbArgs.push('-cors', options.cors);
  }
  if (options.delayTransientStatuses) {
    dynamoDbArgs.push('-delayTransientStatuses');
  }
  if (options.optimizeDbBeforeStartup && options.dbPath) {
    dynamoDbArgs.push('-optimizeDbBeforeStartup');
  }
  if (options.help) {
    dynamoDbArgs.push('-help');
  }

  const commonArgs = ['-jar', jarFilename, '-port', String(options.port)];
  const dockerArgs = ['run', '-d', '-p', `${options.port}:${options.port}`, options.dockerImage];
  if (options.install_path) {
    deprecation('Use installPath instead of install_path');
  }
  const installPath = resolve(options.install_path ?? options.installPath);
  jvmArgs.push(`-Djava.library.path=${installPath}/DynamoDBLocal_lib`);

  const process = options.docker
    ? wrapSpawn(options.dockerPath, [...dockerArgs, ...commonArgs, ...dynamoDbArgs])
    : wrapSpawn('java', [...jvmArgs, ...commonArgs, ...dynamoDbArgs], installPath);

  instances.set(options.port, { options, process });

  await waitFor(() => dynamoDBLocalIsReady(options.port));
};

const wrapSpawn = (executable: string, args: string[], cwd?: string) => {
  const child = spawn(executable, args, {
    env,
    stdio: ['inherit', 'inherit', 'inherit'],
    cwd,
  });

  if (!child.pid) {
    throw new Error(`Unable to start DynamoDB Local. Make sure you have ${executable} in your path.`);
  }

  child.on('error', (error) => {
    throw error;
  });

  child.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.log('DynamoDB Local exited with code', code);
    }
  });

  return child;
};

const waitFor = async (isComplete: () => Promise<boolean>): Promise<void> => {
  // eslint-disable-next-line no-await-in-loop
  while (!(await isComplete())) {
    // eslint-disable-next-line no-await-in-loop
    await setTimeout(100);
  }
};

const dynamoDBLocalIsReady = (port: number): Promise<boolean> => {
  return new Promise((res) => {
    const req = get(`http://localhost:${port}/`, (message) => {
      res(message.statusCode === 400);
    });
    req.on('error', () => {
      res(false);
    });
  });
};
