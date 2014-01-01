module.exports = function(grunt) {
  
  var coffeeSourceFiles = [
    'coffee/*.coffee',
    'coffee/util/*.coffee',
    'coffee/Battle/*.coffee',
    'coffee/Battle/gameplay/*.coffee',
    'coffee/Battle/Pawn/*.coffee',
    'coffee/Battle/ui/*.coffee',
    'coffee/Battle/view/*.coffee'
  ];
  
  /* ex:
   * {
   *    'core/*.js' : 'coffee/*.coffee'
   *    'core/util/*.js' : 'coffee/util/*.coffee'
   *    ...
   * }
   */
  var jsSourceFiles = grunt.file.expandMapping( coffeeSourceFiles, 'core/', {
    rename: function(destBase, destPath) {
      //            "tmp/"     "coffee/game.coffee"
      var newName = destBase + destPath.replace(/\.coffee$/,".js").replace(/^coffee\//,"");
      return newName;
    }
  });
  
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    
    coffee: {
      transpile: { // to JS, but don't join the files together
        options : {
          bare      : true
        },
        files: jsSourceFiles
      }      
    },
    
    shell: {
      // for use with HTML5Preloader
      compileGFXList : {
        command : "ls -1 ./gfx | sed -e 's/\\.[a-zA-Z]*$//' > ./core/RESOURCES_GFX.txt"
      },
      compileSFXList : {
        command : "ls -1 ./snd | sed -e 's/\\.[a-zA-Z]*$//' > ./core/RESOURCES_SND.txt"
      },
      clean: {
        command : "rm -rf ./core"
      }
    },
    
    jasmine_node: {
      useCoffee: true,
      verbose: true,
      extensions: "coffee",
      projectRoot: "./tests/",
      requirejs: true
    },
    
    requirejs: {
      compile: {
        options: {
          optimize: "uglify",
          baseUrl: "./",
          include: "core/game",
          out: "core/<%= pkg.name %>.min.js",
          paths: {
            "text" : "lib/text"
          }
        }
      }
    }
    
  };
  
  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  
  // todo: compile gfx assets into sprite sheet
  
  grunt.registerTask('clean',   ['shell:clean']);
  grunt.registerTask('test',    ['shell:clean', 'coffee:transpile', 'jasmine_node']);
  grunt.registerTask('default', ['shell:clean', 'coffee:transpile', 'shell:compileGFXList', 'shell:compileSFXList', 'requirejs']);
};