import { afterAll, expect, test } from 'vitest';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { DynamoDBClient, CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { install } from './install';
import { jarFilename } from './constants';
import { prepTmpDir, tmpDir } from './helpers.test';
import { start } from './start';
import { stop } from './stop';
import { remove } from './remove';

const port = 8010;
const dbClient = new DynamoDBClient({
  region: 'localhost',
  endpoint: `http://localhost:${port}`,
  credentials: {
    accessKeyId: 'MockAccessKeyId',
    secretAccessKey: 'MockSecretAccessKey',
  },
});

test('install, start, stop, remove', async () => {
  // Given
  const path = resolve(tmpDir, 'index');
  prepTmpDir(path);

  // When
  await install({ installPath: path });

  // Then: the DynamoDB Local binary was installed at the custom path
  expect(existsSync(join(path, jarFilename))).toBe(true);

  // When
  await start({ installPath: path, port });

  // Then we can use DynamoDB (after a short delay)
  const tablesBefore = await dbClient.send(new ListTablesCommand({}));
  expect(tablesBefore.TableNames).not.toContain('TestTable');
  await dbClient.send(new CreateTableCommand({
    TableName: 'TestTable',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  }));
  const tablesAfter = await dbClient.send(new ListTablesCommand({}));
  expect(tablesAfter.TableNames).toContain('TestTable');

  // When
  await stop(port);

  // Then we can't use DynamoDB
  expect(() => dbClient.send(new ListTablesCommand({}))).rejects.toThrow();

  // When
  await remove({ installPath: path });

  // Then: the DynamoDb Local binary is removed
  expect(existsSync(join(path, jarFilename))).toBe(false);
});

// Always ensure the server is stopped after: prevents test failures leaving zombie java processes around.
afterAll(async () => {
  try {
    await stop(port);
  } catch (error) {
    // no-op
  }
});
