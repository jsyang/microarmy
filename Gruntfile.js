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
      //            "core/"    "game.coffee"
      var newName = destBase + destPath.replace(/\.coffee$/,".js").replace(/^coffee\//,"");
      return newName;
    }
  });
  
  // These files may be altered for a specific build. All these files end up in `dist/microarmy.zip`
  var releaseBuildFiles = [
    "core/microarmy.min.js",
    "core/spritesheet.png",
    "core/soundmanager2.swf",
    "index.html"
  ];
  
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
      compileGFXList: {
        command : "ls -1 ./gfx | sed -e 's/\\.[a-zA-Z]*$//' > ./core/RESOURCES_GFX.txt"
      },
      compileSFXList: {
        command : "ls -1 ./snd | sed -e 's/\\.[a-zA-Z]*$//' > ./core/RESOURCES_SND.txt"
      },
      copySoundManager2SWF: {
        command : "cp ./lib/soundmanager2/soundmanager2.swf ./core"
      },
      clean: {
        command : "rm -rf ./core ; rm -rf ./dist"
      },
      
      findTodos : {
        options: {
            stdout: true
        },
        command : "echo '\\n\\n** TODOs located in these files: **'; grep -ril '# todo' coffee/"
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
          name: "lib/almond.js",
          include: [
            "lib/soundmanager2/soundmanager2-nodebug-jsmin.js",
            "lib/soundmanager2/soundmanager2-config-release.js",
            "core/game"
          ],
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
    },
    
    zip: {
      './dist/microarmy.zip' : releaseBuildFiles
    },
    
    preprocess: {
      release: {
        options: {
          context: {
            ENV : 'release'
          }
        },
        files: {
          'index.html' : 'index.template.html'
        }
      },
      dev: {
        options: {
          context: {
            ENV : 'dev'
          }
        },
        files: {
          'index.html' : 'index.template.html'
        }
      }
    },
    
    'sftp-deploy': {
      build: {
        auth: {
          host: '54.209.234.153',
          port: 22,
          authKey: 'ec2key1'
        },
        src: 'dist',
        dest: '/www',
        exclusions: ['./dist/**/.DS_Store']
      }
    }
  };
  
  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-sftp-deploy');
  
  grunt.registerTask('clean',   ['shell:clean']);
  grunt.registerTask('test',    ['shell:clean', 'coffee', 'jasmine_node']);
  
  // todo: fork https://github.com/STAH/grunt-preprocessor and use the preprocessor to build for
  // hybrid web app.
  
  grunt.registerTask('release', [
    'shell:clean',
    'coffee',
    'shell:compileGFXList', // todo: remove this?
    'shell:compileSFXList', // todo: remove this?
    'shell:copySoundManager2SWF',
    'sprite',
    // todo: add step to use the compiled JSON spritesheet source map in the source
    'requirejs:compile',
    'preprocess:release',
    'zip',
    'sftp-deploy'
  ]);
  
  grunt.registerTask('default', [
    'shell:clean',
    'coffee',
    'shell:compileGFXList',
    'shell:compileSFXList',
    'preprocess:dev',
    'shell:findTodos'
  ]);
};