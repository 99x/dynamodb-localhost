# aws-dynamodb-local

> **Note**
> This is a continuation of and drop-in replacement for `dynamodb-localhost`
> (for more info, see [migrating from dynamodb localhost](#migrating-from-dynamodb-localhost))

This library works as a wrapper for [AWS DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html), intended for use in development and testing.

Features:
- Download and install DynamoDB Local
- Start, stop and restart DynamoDB Local, supporting optional attributes as per [AWS's DynamoDB Local Documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).
- Uninstall and remove DynamoDB Local

## Install

Requires Java (either JRE or JDK) version 11.x or newer, for example [Adoptium](https://adoptium.net/).

`npm install aws-dynamodb-local`

## Usage

Usage example

```js
const dynamodbLocal = require("aws-dynamodb-local");

dynamodbLocal.install();
dynamodbLocal.start({ port: 8000 });
```

Supported methods

```ts
// Ensure DynamoDB Local is installed.
// The first time, this will download from AWS and extract files to disk.
// The optional `callback` function is called after the installation is ready to use.
// If already installed, this skips the download and fires the callback immediately.
install(callback)

// Start an instance of DynamoDB Local.
// DynamoDB will then process incoming requests until you stop it.
// The optional `options` object is documented below.
start(options)

// Stops the instance of DynamoDb Local running on an specified port.
stop(port)

// Uninstall and remove DynamoDB Local.
// The optional `callback` function is called after it is removed.
remove(callback)
```

Options for `start`:

```js
const options = {
  port: 8000, /* Port to listen on. Default: 8000 */
  cors: '*', /* Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated "allow" list of specific domains. The default setting for cors is an asterisk (*), which allows public access. */
  inMemory: true, /* DynamoDB; will run in memory, instead of using a database file. When you stop DynamoDB;, none of the data will be saved. Note that you cannot specify both dbPath and inMemory at once. */
  dbPath: '<mypath>/', /* The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both dbPath and inMemory at once. For the path, current working directory is <projectroot>/node_modules/dynamodb-localhost/dynamodb. For example to create <projectroot>/node_modules/dynamodb-localhost/dynamodb/<mypath> you should specify '<mypath>/' with a forward slash at the end. */
  sharedDb: true, /* DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration. */
  delayTransientStatuses: true, /* Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status.) */
  optimizeDbBeforeStartup: true,  /* Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter. */
  heapInitial: undefined, /* A string which sets the initial heap size e.g., heapInitial: '2048m'. This is input to the java -Xms argument */
  heapMax: undefined, /* A string which sets the maximum heap size e.g., heapMax: '1g'. This is input to the java -Xmx argument */
}
```

## Migrating from `dynamodb-localhost`

This is a drop-in replacement for `dynamodb-localhost`. To upgrade therefore:

1. Uninstall `dynamodb-localhost`, e.g. `npm uninstall dynamodb-localhost`
2. Install `aws-dynamodb-local`, e.g. `npm install aws-dynamodb-local`
3. Update references in your code from `dynamodb-localhost` to `aws-dynamodb-local`

### Why fork?

**DynamoDB Local changes:** AWS continue to make changes to DynamoDB local, including breaking changes. These changes [break](https://github.com/99x/dynamodb-localhost/issues/79) [things](https://github.com/99x/dynamodb-localhost/issues/83) [in](https://github.com/99x/serverless-dynamodb-local/issues/297) [some](https://github.com/99x/serverless-dynamodb-local/issues/294) [packages](https://github.com/99x/dynamodb-localhost/issues/62), including `dynamodb-localhost`.

**99x have stopped maintenance:** 99x used to maintain `dynamodb-localhost` and `serverless-dynamodb-local`. Unfortunately in recent years 99x have stopped updating these packages. They do not look likely to fix these issues soon: many issues and PRs for critical problems have been sitting around for some years now, and the libraries are effectively unusable as-is now. We tried contacting them by email about this, and asked whether they could merge the critical PRs or pass ownership to someone who would maintain the packages. We did not get a reply.

**Need for stability and reliability:** At [Raise](https://github.com/raisenational), we've found these packages useful for developing our open-source campaigns platform. However, these packages frequently cause us pain: having to constantly apply custom patches to them and having them break in unexpected ways. We'd like to make the packages stable and reliable for all to use, as well as support the community around these packages.

### Why this fork?

At the time of forking, we reviewed other forks available and found none of them met our criteria:

- Actively maintained (e.g. addressed AWS's recent changes to DynamoDB Local v2.x)
- Indication that maintenance would continue (e.g. made some commitment to maintaining it into the future, and ideally had organizational backing)
- Well documented (e.g. had updated their documentation to correctly explain how to install the fork)
- Open to community contributions (e.g. were open to PRs, had contributing instructions)

We hope to address all of these, so that people have a stable and reliable version to depend on:

- Maintenance:
  - We depend on this library to work properly, so that we can develop and test key applications we have in production. As such, we're likely to catch issues quickly ourselves and care about resolving them quickly.
  - We've got experience and a history of maintaining similar libraries. For example, we created and maintain [aws-ses-v2-local](https://github.com/domdomegg/aws-ses-v2-local) and [serverless-offline-ses-v2](https://github.com/domdomegg/serverless-offline-ses-v2): tools to run the AWS SES service locally. It gets thousands of downloads per week, is actively maintained, and we have reviewed and accepted many community issues and PRs.
- Maintenance continuing:
  - We've used this library ourselves for a couple years in our most important applications, and it doesn't look like it's going anywhere. We're highly incentivize to ensure this is kept well maintained for the long-term.
  - We have a track record of maintaining products externally for a long time. We've never deprecated an in-use library, and we're hitting our [5 year anniversary on some of our libraries](https://github.com/domdomegg/halifax-share-dealing-sdk).
  - Raise is a [registered charity in England and Wales](https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/5208930) with multiple software engineers, and has been operating for several years.
  - We're publicly committed to a long-term maintenance plan. In the unlikely event that we are unable to continue maintaining this library, we commit to transferring ownership to another organization, as directed by the community, that will look after this library well.
- Well documented:
  - We care deeply about solid documentation, and ideally writing code that makes things so easy to use they don't need documentation. We intentionally changed the name to distinguish this package easily, and updated the documentation here to explain the relationship between this and `dynamodb-localhost`.
- Community:
  - We're committed to supporting the community around `aws-dynamodb-local` and `serverless-offline-dynamodb`. We're a charity that works in the open, with all our software projects being open-source. Our team members have experience supporting communities on several open-source projects, as well as being open-source maintainers of popular projects that accept community contributions.

If you have feedback on our fork, positive or constructive, we'd love to hear it. Either [open a GitHub issue](https://github.com/raisenational/aws-dynamodb-local/issues/new) or contact us using the details on [our profile](https://github.com/raisenational).

## Contributing

Pull requests are welcomed on GitHub! To get started:

1. Install Git and Node.js
2. Clone the repository
3. Install dependencies with `npm install`
4. Run `npm run test` to run tests
5. Build with `npm run build`

## Credits

aws-dynamodb-local is derived from [99x/dynamodb-localhost](https://github.com/99x/dynamodb-localhost), which itself was derived from [rynop/dynamodb-local](https://github.com/rynop/dynamodb-local).
