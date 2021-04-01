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
        calver.init(this.getFormat());
        // TODO: This will currently cause the official release to start on version x.x.1 instead of x.x.0.
        //       Should we fix? Doesn't look bad end-user.
        const calverVersion = calver.inc(this.getFormat(), latestVersion, 'calendar');
        const { preRelease } = this.config.options;
        let level = DEFAULT_LEVEL;
        if (preRelease) {
            level = `calendar.${preRelease}`;
        }

        return calver.inc(this.getFormat(), calverVersion, level)
    }

    getIncrementedVersionCI() {
        return this.getIncrementedVersion(...arguments);
    }

    getIncrement() {
        return this.getIncrementedVersion(...arguments);
    }
}

module.exports = CalverPlugin;