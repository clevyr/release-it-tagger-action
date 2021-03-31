'use strict';

const config = {
    "npm": {
        "publish": false,
        "ignoreVersion": true
    },
    "git": {
        "tagName": "v${version}"
    },
    "plugins": {
        "@release-it/bumper": {
            "in": {
                "file": "VERSION",
                "type": "text/plain"
            },
            "out": {
                "file": "VERSION",
                "type": "text/plain"
            },
        },
    },
};

// Adds directory path for local plugin dynamically
const calverPluginPath = `${__dirname}/clevyr-calver-plugin.js`;
config["plugins"][calverPluginPath] = {};

module.exports = config;
