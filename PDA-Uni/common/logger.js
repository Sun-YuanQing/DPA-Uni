'use strict';

var storage = require('./storage');

var Levels = {
    debug: 1,
    warn: 2,
    error: 3,

    toString: function toString(level) {
        switch (level) {
            case this.debug:
                return 'DEBUG';
            case this.warn:
                return 'WARN';
            case this.error:
                return 'ERROR';
        }
    }
};

var LogEntry = function LogEntry(level, source, message, data) {
    this.level = level;
    this.source = source;
    this.message = message;
    this.data = data;

    this.timestamp = new Date().toLocaleString();
};

var consoleLogger = {
    write: function write(entry) {
        var buffer = entry.timestamp + ' [' + Levels.toString(entry.level) + ' ' + entry.source + ' ' + entry.message + '] ' + (entry.data ? JSON.stringify(entry.data) : '');

        switch (entry.level) {
            case Levels.debug:
                {
                    console.log(buffer);
                    break;
                }
            case Levels.warn:
                {
                    console.warn(buffer);
                    break;
                }
            case Levels.error:
                {
                    console.error(buffer);
                    break;
                }
        }
    }
};

var storageLogger = {
    LOG_PREFIX: 'logs_item_',
    LENGTH_KEY: 'logs_length',

    write: function write(entry) {
        var index = this.count(),
            length = index + 1;
        entry.index = index;

        storage.set(this.LOG_PREFIX + index, entry);

        storage.set(this.LENGTH_KEY, length);
    },
    read: function read() {
        var logs = [],
            items = storage.search(this.LOG_PREFIX);

        items.sort(function (a, b) {
            return a.index > b.index ? 1 : -1;
        });

        for (var i = 0; i < items.length; i++) {
            logs.push(items[i]);
        }

        return logs;
    },
    clear: function clear() {
        var length = this.count(),
            keys = [];

        for (var i = 0; i < length; i++) {
            storage.remove(this.LOG_PREFIX + i);
        }

        storage.set(this.LENGTH_KEY, 0);
    },
    count: function count() {
        var count = storage.get(this.LENGTH_KEY) || 0;

        return count;
    }
};

var logger = {
    settings: {
        'logModel': 'console'
    },
    write: function write(entry) {
        switch (this.settings.logModel) {
            case 'console':
                consoleLogger.write(entry);
                break;
            case 'storage':
                storageLogger.write(entry);
                break;
        }
    },

    debug: function debug(source, message, data) {
        var entry = new LogEntry(Levels.debug, source, message, data);

        this.write(entry);
    },
    warn: function warn(source, message, data) {
        var entry = new LogEntry(Levels.warn, source, message, data);

        this.write(entry);
    },
    error: function error(source, message, data) {
        var entry = new LogEntry(Levels.error, source, message, data);

        this.write(entry);
    }
};

module.exports = logger;