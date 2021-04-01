const core = require('@actions/core');
const releaseIt = require('release-it');

const GITHUB_REF_KEY = 'github-ref';
const DEV_BRANCH_KEY = 'dev-branch';
const STAGE_BRANCH_KEY = 'stage-branch';
const PROD_BRANCH_KEY = 'prod-branch';

function attachPlugins(pluginsArray) {
    const plugins = [
        require('./bumper-plugin-addon'),
        require('./calver-plugin-addon'),
    ];
    for(const i in plugins) {
        const p = new plugins[i]();
        const path = require.resolve(p.pluginPath);
        pluginsArray[path] = p.options;
    }
}

function preReleaseType() {
    const githubRef = core.getInput(GITHUB_REF_KEY);
    const devBranch = core.getInput(DEV_BRANCH_KEY);
    const stageBranch = core.getInput(STAGE_BRANCH_KEY);
    const prodBranch = core.getInput(PROD_BRANCH_KEY);

    switch (githubRef) {
        case devBranch:
            return 'alpha';
        case stageBranch:
            return 'beta';
        case prodBranch:
            return false;
        default:
            return 'dev';
    }
}

try {
    const preRelease = preReleaseType();
    const options = {
        'dry-run': true,
        'ci': true,
        'preRelease': preRelease,
        "npm": { "publish": false },
        "git": { "tagName": "v${version}" },
        'plugins': {}
    };
    attachPlugins(options['plugins']);
    releaseIt(options).then(data => {
        core.setOutput("version", data.version);
    });
} catch (error) {
    core.setFailed(error.message);
}
