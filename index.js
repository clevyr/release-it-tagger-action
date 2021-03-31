const core = require('@actions/core');
const childProcess = require('child_process');

const PRE_RELEASE_KEY = 'pre-release';
const NPM_BASE_COMMAND = 'npm run release';

try {
    const preRelease = core.getInput(PRE_RELEASE_KEY);
    let command = NPM_BASE_COMMAND;

    if (preRelease) {
        core.info(`${PRE_RELEASE_KEY} set, using ${preRelease} increment strategy`);
        command += ` -- --preRelease=${preRelease}`;
    } else {
        core.info(`No ${PRE_RELEASE_KEY} set, using default increment strategy`);
    }

    childProcess.execSync(command);
    core.setOutput("version", newVersion);
} catch (error) {
    core.setFailed(error.message);
}
