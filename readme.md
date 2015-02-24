gulp-json-fmt
=============

[Gulp.js](http://gulpjs.com/) plugin wrapping the [json-fmt](https://github.com/MaxArt2501/json-fmt) module.

## Installation

You'll probably use this plugin together with gulp.js as build tool/task runner:

```bash
npm install --save-dev gulp-json-fmt
```

## Usage

This is a pretty basic usage, taking JSON files from a directory and writing them in another one after the transformation:

```js
var jsonFmt = require("gulp-json-fmt");

gulp.src("./data/*.json")
    .pipe(jsonFmt())
    .pipe(gulp.dest("./data/minified"));
```

`jsonFmt()` can accept an object as the argument containing the options for the `JSONFormatter` class. In addition, `jsonFmt.MINI` and `jsonFmt.PRETTY` are references to `JSONFormatter.MINI` and `JSONFormatter.PRETTY` respectively (see [`json-fmt`'s page](https://github.com/MaxArt2501/json-fmt) for more informations):

```js
gulp.src("./data/*.json")
    .pipe(jsonFmt({ spacedArray: true, spacedObject: true }))

gulp.src("./data/*.json")
    .pipe(jsonFmt(jsonFmt.PRETTY))
```

## License

MIT. See [LICENSE](LICENSE) for details.