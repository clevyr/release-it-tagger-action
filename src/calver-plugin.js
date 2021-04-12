// # Originally pulled/modified from https://github.com/casmith/release-it-calver-plugin
'use strict';

const Plugin = require('release-it/lib/plugin/Plugin'),
    calver = require('calver'),
    DEFAULT_FORMAT = 'yy.mm.micro.dev',
    DEFAULT_LEVEL = 'micro';

class CalverPlugin extends Plugin {
    getFormat() {
        return this.getContext().format || DEFAULT_FORMAT;
    }

    getIncrementedVersion({latestVersion}) {
        latestVersion = latestVersion === '0.0.0' ? '1.1.1' : latestVersion;
        calver.init(this.getFormat());
        try {
            latestVersion = calver.inc(this.getFormat(), latestVersion, 'calendar');
        } catch (e) {
            // If the above failed, it was because current date is accurate, continue.
        }
        const { preRelease } = this.config.options;
        const level = preRelease || DEFAULT_LEVEL;
        return calver.inc(this.getFormat(), latestVersion, level)
    }

    getIncrementedVersionCI() {
        return this.getIncrementedVersion(...arguments);
    }

    getIncrement() {
        return this.getIncrementedVersion(...arguments);
    }
}

module.exports = CalverPlugin;