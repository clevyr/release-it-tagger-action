const core = require('@actions/core');
const github = require('@actions/github');
const releaseIt = require('release-it');

const BUILD_INPUT = () => core.getInput('build');

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
    'github-create-release': {
        key: 'github-release',
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
    if (BUILD_INPUT()) {
        hooksArray['after:bump'] = BUILD_INPUT();
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

let _local;
function isLocal() {
    if (typeof _local !== 'undefined') return _local;
    const local = isNaN(github.context.runId);
    if (!local) {
        // Initialize user name and email for github push
        const actor = process.env['GITHUB_ACTOR'];
        require('simple-git')()
            .addConfig('user.name', actor)
            .addConfig('user.email', `${actor}@users.noreply.github.com`);
    }
    _local = local;
    return local;
}

let _hasBeenTagged;
function hasBeenTagged() {
    if (typeof _hasBeenTagged !== 'undefined') return _hasBeenTagged;
    const { gitDescribeSync } = require('git-describe');
    const describe = gitDescribeSync(null, {
        requireAnnotated: true,
        customArguments: ['--contains', 'HEAD'],
    });
    const tagRegex = /^v[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}/g
    _hasBeenTagged = tagRegex.test(describe.raw);
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
            'tag': true,
            'addUntrackedFiles': BUILD_INPUT() !== '',
        },
        'github': {
            'release': sanitizeToggleInput(TOGGLES['github-create-release']) || false,
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
