'use strict';

const Plugin = require('release-it/lib/plugin/Plugin');

class PluginAddon extends Plugin {
    constructor(pluginPath, options, args) {
        super(args);
        this.options = options ? options : {};
        this.pluginPath = pluginPath;
    }

    getOptions() {
        return this.options;
    }
}

module.exports = PluginAddon;
