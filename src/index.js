const core = require('@actions/core');
const releaseIt = require('release-it');

const PRE_RELEASE_KEY = 'pre-release';

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

try {
    const preRelease = core.getInput(PRE_RELEASE_KEY);
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
