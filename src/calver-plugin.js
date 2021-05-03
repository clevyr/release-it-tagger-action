// # Originally pulled/modified from https://github.com/casmith/release-it-calver-plugin
'use strict';

const Plugin = require('release-it/lib/plugin/Plugin'),
    calver = require('calver'),
    DEFAULT_FORMAT = 'yy.mm.micro.dev',
    DEFAULT_VERSION = '1.1.1',
    DEFAULT_LEVEL = 'micro';

class CalverPlugin extends Plugin {
    getFormat() {
        return this.getContext().format || DEFAULT_FORMAT;
    }

    getIncrementedVersion({latestVersion}) {
        if (this.config.options['dry-run']) return this.config.contextOptions.latestTag.replace(/^v/g, '');
        calver.init(this.getFormat());
        if (this.config.options.preRelease === false) {
            try {
                latestVersion = calver.inc(this.getFormat(), latestVersion, 'calendar');
            } catch (e) {
                // If the above failed, it was because current date is accurate, continue.
            }
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

    getLatestVersion() {
        const { execFileSync } = require('child_process');
        const headCommit = execFileSync('git', ['rev-list', '--tags', '--max-count=1'])
            .toString().trim();
        if (headCommit) {
            const headTag = execFileSync('git', ['describe', '--tags', headCommit.trim()])
                .toString().trim().replace(/^v/g, '');
            if (headTag) return headTag;
        }
        return DEFAULT_VERSION;
    }
}

module.exports = CalverPlugin;