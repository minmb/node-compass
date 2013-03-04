var spawn = require('child_process').spawn,
    path = require('path'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter
    defaults = {
        'syntax': 'sass'
    };

function CompassError(message) {
    this.name = "CompassError";
    this.message = (message || "");
}
util.inherits(CompassError, Error);

function Compass(opts) {

    EventEmitter.call(this);

    opts = opts || {};
    for (var key in defaults) {
        if (opts[key] === undefined) {
            opts[key] = defaults[key];
        }
    }

    this.compile = function(src, callback) {

        var _this = this;

        var args = ['-s', '--compass'];
        if (opts.syntax === 'scss') {
            args.push('--scss');
        }

        if (opts.loadPath) {
            var loadPath = opts.loadPath;

            if (typeof loadPath === 'string') {
                loadPath = [loadPath];
            }

            for (var i in loadPath) {
                args.push('-I' + loadPath[i]);
            }
        }

        var compass = spawn('sass', args);
        var output = '',
            error  = '';

        compass.stdin.write(src);
        compass.stdin.end();

        compass.stdout.on('data', function(data) {
            output += data;
        });

        compass.stderr.on('data', function(data) {
            error += data;
        });

        compass.on('exit', function(code) {

            if (code !== 0) {
                this.emit('error', new CompassError(error));
            } else {
                callback(output);
            }

        });

    };

};

util.inherits(Compass, EventEmitter);

module.exports = Compass;