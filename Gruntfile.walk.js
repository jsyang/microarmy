// Get a list of all the subdirectories by walking through them and possibly add a suffix.
// Adapted from http://stackoverflow.com/a/16684530

var fs = require('fs');

var walk = function(dir, suffix) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function(file) {
      file = dir + '/' + file;
      var stat = fs.statSync(file);
      if(stat) {
        if (stat.isDirectory()) {
          results = results.concat( walk(file, suffix) );
          if (suffix) {
            file += suffix;
          }
          results.push(file);
        }
      }
  });
  return results;
};

var walkIncludeParentDir = function(dir, suffix) {
  var results = walk(dir, suffix);
  if (suffix) {
    dir += suffix;
  }
  results.push(dir);
  return results;
}

module.exports = walkIncludeParentDir;