'use strict';

const config = {
    "npm": {
        "publish": false,
        "ignoreVersion": true
    },
    "git": {
        "tagName": "v${version}"
    },
    "plugins": {},
};

// Adds plugins with dynamically generated paths
const bumperPluginPath = require.resolve('@release-it/bumper');
config["plugins"][bumperPluginPath] = {
    "in": {
        "file": "VERSION",
        "type": "text/plain"
    },
    "out": {
        "file": "VERSION",
        "type": "text/plain"
    },
};
const calverPluginPath = `${__dirname}/clevyr-calver-plugin.js`;
config["plugins"][calverPluginPath] = {};

module.exports = config;
