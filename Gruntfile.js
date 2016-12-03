var config = {
  data: {
    paths: { src: 'src', build: 'build' }
  }
};

module.exports = function (grunt) {
  require('load-grunt-config')(grunt, config);
};