'use strict';

const PluginAddon = require('./plugin-addon'),
    PLUGIN_PATH = require.resolve(`${__dirname}/calver-plugin`),
    OPTIONS = {};

class CalverPluginAddon extends PluginAddon {
    constructor() {
        super(PLUGIN_PATH, OPTIONS, ...arguments);
    }
}

module.exports = CalverPluginAddon;