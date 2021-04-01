'use strict';

const PluginAddon = require('./plugin-addon'),
    PLUGIN_PATH = require.resolve('@release-it/bumper'),
    OPTIONS = {
        "in": {
            "file": "VERSION",
            "type": "text/plain"
        },
        "out": {
            "file": "VERSION",
            "type": "text/plain"
        }
    };

class BumperPluginAddon extends PluginAddon {
    constructor() {
        super(PLUGIN_PATH, OPTIONS, ...arguments);
    }
}

module.exports = BumperPluginAddon;