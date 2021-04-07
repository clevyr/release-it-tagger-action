const core = require('@actions/core');
const github = require('@actions/github');
const git = require('simple-git');
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

function attachHooks(hooksArray) {
    if (core.getInput('build')) {
        hooksArray['after:bump'] = core.getInput('build');
    }
}

function preReleaseType() {
    const githubRef = !isLocal() && github.context.ref;
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

function isLocal() {
    return isNaN(github.context.runId);
}

let _hasBeenTagged;
function hasBeenTagged() {
    if (typeof _hasBeenTagged !== 'undefined') return _hasBeenTagged;
    const { gitDescribeSync } = require('git-describe');
    const describe = gitDescribeSync(null, {
        requireAnnotated: true,
        customArguments: ['--contains', 'HEAD'],
    });
    _hasBeenTagged = describe.tag !== null;
    console.log('_writeVersionInfo: ', _hasBeenTagged);
    return _hasBeenTagged;
}

try {
    const preRelease = preReleaseType();
    const options = {
        'dry-run': hasBeenTagged(),
        'ci': true,
        'preRelease': preRelease,
        'npm': { 'publish': false },
        'git': {
            'tagName': 'v${version}',
            'commitMessage': ':pushpin: Release ${version}',
            'release': sanitizeToggleInput(TOGGLES['github-create-release']) || false,
            'tag': true,
        },
        'hooks': {},
        'plugins': {},
    };
    attachPlugins(options['plugins']);
    attachHooks(options['hooks']);
    releaseIt(options).then(data => {
        core.setOutput('version', data.version);
    }, error => {
        core.setFailed(error.message);
    });
} catch (error) {
    core.setFailed(error.message);
}
