var File = require("vinyl"),
    expect = require("expect.js"),
    es = require("event-stream"),
    jsonFmt = require("../"),
    fs = require("fs");

var getBuffer = Buffer.from || function(string, encoding) {
    return new Buffer(string, encoding);
}

var buffer = getBuffer(" [ 1, {\n\t\"foo\" : null \n\}  , true]  "),
    random = fs.readFileSync(__dirname + "/samples/random.json"),
    pretty = fs.readFileSync(__dirname + "/samples/random.pp.json"),
    mini = fs.readFileSync(__dirname + "/samples/random.min.json");

describe("gulp-json-fmt", function() {
    describe("in buffer mode", function() {
        it("should minify files with default options", function(done) {
            jsonFmt()
                .on("data", function(output) {
                    expect(output.isBuffer()).to.be(true);
                    expect(output.contents.toString()).to.be("[1,{\"foo\":null\},true]");
                    done();
                })
                .on("error", done)
                .write(new File({ contents: buffer }));
        });

        it("should correctly pass options to the formatter", function(done) {
            jsonFmt({ spacedArray: true, spacedObject: true, spaceAfterComma: true, spaceAfterColon: true })
                .on("data", function(output) {
                    expect(output.contents.toString()).to.be("[ 1, { \"foo\": null \}, true ]");
                    done();
                })
                .on("error", done)
                .write(new File({ contents: buffer }));
        });

        it("should be able to use prettifying options", function(done) {
            jsonFmt(jsonFmt.PRETTY)
                .on("data", function(output) {
                    expect(output.contents.toString()).to.be("[\n  1,\n  {\n    \"foo\": null\n  \},\n  true\n]");
                    done();
                })
                .on("error", done)
                .write(new File({ contents: buffer }));
        });

        it("should minify larger buffers", function(done) {
            var file = new File({ contents: random });

            jsonFmt()
                .on("data", function(output) {
                    expect(output.contents.toString()).to.be(mini.toString());
                    done();
                })
                .on("error", done)
                .write(file);
        });

        it("should prettify larger buffers", function(done) {
            jsonFmt(jsonFmt.PRETTY)
                .on("data", function(output) {
                    expect(output.contents.toString()).to.be(pretty.toString());
                    done();
                })
                .on("error", done)
                .write(new File({ contents: random }));
        });

        it("should throw on broken buffers", function(done) {
            jsonFmt(jsonFmt.PRETTY)
                .on("data", function() {
                    done(new Error("Must throw a JSONError"));
                })
                .on("error", function(err) {
                    expect(err.name).to.be("JSONError");
                    done();
                })
                .write(new File({ contents: random.slice(0, 500) }));
        });

        it("should throw on invalid data", function(done) {
            jsonFmt(jsonFmt.PRETTY)
                .on("data", function() {
                    done(new Error("Must throw a JSONError"));
                })
                .on("error", function(err) {
                    expect(err.name).to.be("JSONError");
                    done();
                })
                .write(new File({ contents: getBuffer("[ 'wrong string' ]") }));
        });
    });

    describe("in streaming mode", function() {
        it("should just work", function(done) {
            jsonFmt()
                .on("data", function(file) {
                    expect(file.isStream()).to.be(true);
                    file.contents.pipe(es.wait(function(e, output) {
                        if (e) done(e);
                        else {
                            expect(output.toString()).to.be(mini.toString());
                            done();
                        }
                    }));
                })
                .write(new File({
                    contents: es.readArray([ random.slice(0, 400), random.slice(400, 800), random.slice(800) ])
                }));
        });

        it("should throw on broken streams", function(done) {
            jsonFmt()
                .on("data", function(file) {
                    file.contents
                        .on("data", function() {})
                        .on("error", function(err) {
                            expect(err.name).to.be("JSONError");
                            done();
                        })
                        .on("end", function(err) {
                            done(new Error("Must throw a JSONError"));
                        })
                })
                .on("error", function() {})
                .write(new File({
                    contents: es.readArray([ random.slice(0, 500) ])
                }));
        });
    });
});