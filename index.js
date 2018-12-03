/*!
 * gulp-json-fmt
 * https://github.com/MaxArt2501/gulp-json-fmt
 *
 * Copyright (c) 2015-2018 Massimo Artizzu
 * Licensed under the MIT license.
 */
"use strict";

var JSONFormatter = require("json-fmt"),
    PluginError = require("plugin-error"),
    through = require("through2");

var getBuffer = Buffer.from || function(string, encoding) {
    return new Buffer(string, encoding);
};

function jsonFmt(options) {
    return through.obj(function(file, encoding, done) {
        if (file.isNull()) {
            // Nothing to do here
            this.push(file), done();
            return;
        }
        try {
            var fmt = new JSONFormatter(options);

            if (file.isBuffer()) {
                // Buffer mode
                file.contents = getBuffer(fmt.end(file.contents).flush(), encoding);
                done(null, file);
            } else if (file.isStream()) {
                // Stream mode
                var stream = through(function(chunk, encoding, callback) {
                    try {
                        callback(null, getBuffer(fmt.append(chunk).flush()));
                    } catch (ee) { callback(ee); }
                }, function(callback) {
                    try {
                        // Final check
                        fmt.end();
                        callback();
                    } catch (ee) { callback(ee); }
                });
                stream.on("error", done);
                file.contents = file.contents.pipe(stream);
                done(null, file);
            } else done(new PluginError("gulp-json-fmt", "Invalid input type"));
        } catch (e) {
            done(new PluginError("gulp-json-fmt", e));
        }
    });
}

jsonFmt.MINI = JSONFormatter.MINI;
jsonFmt.PRETTY = JSONFormatter.PRETTY;
jsonFmt.JSONError = JSONFormatter.JSONError;

module.exports = exports = jsonFmt;