import { getInput, setFailed, setOutput, info } from '@actions/core';
import { execSync } from 'child_process';

const PRE_RELEASE_KEY = 'pre-release';
const NPM_BASE_COMMAND = 'npm run release';

try {
    const preRelease = getInput(PRE_RELEASE_KEY);
    let command = NPM_BASE_COMMAND;

    if (preRelease) {
        info(`${PRE_RELEASE_KEY} set, using ${preRelease} increment strategy`);
        command += ` -- --preRelease=${preRelease}`;
    } else {
        info(`No ${PRE_RELEASE_KEY} set, using default increment strategy`);
    }

    execSync(command);
    setOutput("version", newVersion);
} catch (error) {
    setFailed(error.message);
}
