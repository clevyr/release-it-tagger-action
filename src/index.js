const core = require('@actions/core');
const github = require('@actions/github');
const releaseIt = require('release-it');

const BRANCHES = {
    'dev': {
        key: 'dev-branch',
        default: 'dev',
    },
    'stage': {
        key: 'stage-branch',
        default: 'stage',
    },
    'prod': {
        key: 'prod-branch',
        default: 'master',
    },
};
const sanitizeBranchInput = (branch) => core.getInput(branch.key) === '' ?
    branch.default : core.getInput(branch.key);
const TOGGLES = {
    'github-create-tag': {
        key: 'github-create-tag',
        default: true,
    },
    'github-create-release': {
        key: 'github-create-release',
        default: false,
    },
}
const sanitizeToggleInput = (toggle) => core.getInput(toggle.key) === '' ?
    toggle.default : core.getInput(toggle.key).toLowerCase() === 'true';

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
    const githubRef = github.context.payload.pull_request.base.ref;
    const devBranch = sanitizeBranchInput(BRANCHES['dev']);
    const stageBranch = sanitizeBranchInput(BRANCHES['stage']);
    const prodBranch = sanitizeBranchInput(BRANCHES['prod']);
    core.info(`githubRef = ${githubRef}`);
    core.info(`devBranch = ${devBranch}`);
    core.info(`prodBranch = ${prodBranch}`);

    const printPreRelease = (type) => core.info(`Using pre-release type: ${type}`);
    switch (githubRef) {
        case devBranch:
            printPreRelease('alpha');
            return 'alpha';
        case stageBranch:
            printPreRelease('beta');
            return 'beta';
        case prodBranch:
            printPreRelease('false');
            return false;
        default:
            printPreRelease('dev');
            return 'dev';
    }
}

try {
    const preRelease = preReleaseType();
    core.info(`git-create-release: ${core.getInput("git-create-release")}`)
    core.info(`git-create-tag: ${core.getInput("git-create-tag")}`)
    const options = {
        'ci': true,
        'preRelease': preRelease,
        "npm": { "publish": false },
        "git": {
            "tagName": "v${version}",
            "commitMessage": ":pushpin: Release ${version}",
            "release": sanitizeToggleInput(TOGGLES["github-create-release"]),
            "tag": sanitizeToggleInput(TOGGLES["github-create-tag"]),
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
