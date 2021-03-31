const core = require('@actions/core');
const releaseIt = require('release-it');

const PRE_RELEASE_KEY = 'pre-release';

try {
    const preRelease = core.getInput(PRE_RELEASE_KEY);
    releaseIt({
        'config': `${__dirname}/config.js`,
        'dry-run': true,
        'ci': true,
        'preRelease': preRelease,
    }).then(data => {
        core.setOutput("version", data.version);
    });
} catch (error) {
    core.setFailed(error.message);
}
