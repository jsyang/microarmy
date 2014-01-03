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
  
  /* Final release build files:
   * core/microarmy.min.js
   *
   * Not compilable yet:
   * !core/assets/sprites.png
   * !core/assets/sound/*
   */
  
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    
    coffee: {
      compileToJS: {
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
      compileNoUglify: {
        options: {
          baseUrl: "./",
          name: "lib/almond.js",
          include: "core/game",
          insertRequire: ["core/game"],
          out: "core/<%= pkg.name %>.min.js",
          paths: {
            "text" : "lib/text"
          }
        }
      },
      
      compile: {
        options: {
          optimize: "uglify",
          baseUrl: "./",
          name: "lib/almond.js",
          include: "core/game",
          insertRequire: ["core/game"],
          out: "core/<%= pkg.name %>.min.js",
          paths: {
            "text" : "lib/text"
          }
        }
      }
    },
    
    sprite: {
      all: {
        src: ["./gfx/*.png"],
        destImg: "./core/spritesheet.png",
        destCSS: "./core/spritesheet.json",
        algorithm: 'binary-tree',
        engine: "gm"
      }
    }
    
  };
  
  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-spritesmith');
   
  grunt.registerTask('clean',   ['shell:clean']);
  grunt.registerTask('test',    ['shell:clean', 'coffee', 'jasmine_node']);
  
  grunt.registerTask('release', [
    'shell:clean',
    'coffee',
    'shell:compileGFXList',
    'shell:compileSFXList',
    'sprite',
    // todo: add step to use the compiled JSON spritesheet source map in the source
    'requirejs:compile'
  ]);
  
  grunt.registerTask('default', [
    'shell:clean',
    'coffee',
    'shell:compileGFXList',
    'shell:compileSFXList',
    'requirejs:compileNoUglify'
  ]);
};