'use strict';

var spawn = require('child_process').spawn,
    utils = require('./utils');

var starter = {
    start: function (options, config) {
        /* Dynamodb local documentation http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html */
        var preArgs = [],
            additionalArgs = [],
            port = options.port || config.start.port,
            db_dir = options.install_path || utils.absPath(config.setup.install_path),
            jar = config.setup.jar;

        if (options.heapInitial) {
            preArgs.push(`-Xms${options.heapInitial}`);
        }
        if (options.heapMax) {
            preArgs.push(`-Xmx${options.heapMax}`);
        }
        if (options.dbPath) {
            additionalArgs.push('-dbPath', options.dbPath);
        } else {
            additionalArgs.push('-inMemory');
        }
        if (options.sharedDb) {
            additionalArgs.push('-sharedDb');
        }
        if (options.cors) {
            additionalArgs.push('-cors', options.cors);
        }
        if (options.delayTransientStatuses) {
            additionalArgs.push('-delayTransientStatuses');
        }
        if (options.optimizeDbBeforeStartup) {
            additionalArgs.push('-optimizeDbBeforeStartup');
        }
        if (options.help) {
            additionalArgs.push('-help');
        }

        var args = ['-jar', jar, '-port', port];
        var executable;
        var cwd;

        if (options.docker) {
            executable = process.env.DOCKER_PATH || 'docker';
            preArgs = ['run', '-d', '-p', port + ':' + port, process.env.DOCKER_IMAGE || 'amazon/dynamodb-local'];
        } else {
            executable = 'java';
            preArgs.push('-Djava.library.path=' + db_dir + '/DynamoDBLocal_lib');
            cwd = db_dir;
        }

        args = preArgs.concat(args.concat(additionalArgs));
        var child = spawn(executable, args, {
            cwd: cwd,
            env: process.env,
            stdio: ['pipe', 'pipe', process.stderr]
        });

        if (!child.pid) {
            throw new Error('Unable to start DynamoDB Local process! Make sure you have ' + executable + ' executable in your path.');
        }

        child.on('error', function (code) {
            throw new Error(code);
        });

        return {
            proc: child,
            port: port
        };
    },
};

module.exports = starter;
