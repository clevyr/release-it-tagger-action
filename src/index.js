const core = require('@actions/core');
const github = require('@actions/github');
const releaseIt = require('release-it');

const BRANCHES = {
    'dev': {
        key: 'dev-branch',
        default: 'refs/heads/dev',
    },
    'stage': {
        key: 'stage-branch',
        default: 'refs/heads/stage',
    },
    'prod': {
        key: 'prod-branch',
        default: 'refs/heads/master',
    },
};

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
    const githubRef = github.context.ref;
    const sanitizeBranchInput = (branch) =>  core.getInput(branch.key) === '' ?
        branch.default : core.getInput(branch['key']);
    const devBranch = sanitizeBranchInput(BRANCHES['dev']);
    const stageBranch = sanitizeBranchInput(BRANCHES['stage']);
    const prodBranch = sanitizeBranchInput(BRANCHES['prod']);

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
        'ci': true,
        'preRelease': preRelease,
        "npm": { "publish": false },
        "git": {
            "tagName": "v${version}",
            "commitMessage": ":pushpin: Release ${version}",
            "release": false,
            "tag": false,
        },
        'plugins': {}
    };
    attachPlugins(options['plugins']);
    releaseIt(options).then(data => {
        core.setOutput("version", data.version);
    }, error => {
        core.setFailed(error.message);
    });
} catch (error) {
    core.setFailed(error.message);
}
