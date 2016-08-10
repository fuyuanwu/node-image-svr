var fs = require('fs');
var thinkjs = require('thinkjs');

var fs_exists = think.promisify(fs.exists)
var fs_stat = think.promisify(fs.stat, fs)
var fs_readFile = think.promisify(fs.readFile, fs)
var fs_writeFile = think.promisify(fs.writeFile, fs)

var generator = function * () {
  var filepath = './img/not_find/not_find.png'
  var exists = fs.existsSync(filepath)

  fs.stat(filepath, function (err, stat) {
    console.log( stat)
  })
}

var gen = generator()
gen.next()
gen.next()
gen.next()