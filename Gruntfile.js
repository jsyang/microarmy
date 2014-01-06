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
    "core/snd/*",
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
      compileSFXList: {
        command : "ls -1 ./snd | sed -e 's/\\.[a-zA-Z]*$//' > ./core/RESOURCES_SND.txt"
      },
      copySoundManager2SWF: {
        command : "cp ./lib/soundmanager2/soundmanager2.swf ./core"
      },
      copySounds: {
        command : "mkdir ./core/snd ; cp ./snd/* ./core/snd"
      },
      clean: {
        command : [
          "rm -rf ./core",
          "rm -rf ./dist/*"
        ].join(' ; ')
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
          optimize: "none", //"uglify",
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
    
    unzip: {
      './dist' : './dist/microarmy.zip'
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
  
  grunt.registerTask('test',    ['shell:clean', 'coffee', 'jasmine_node']);
  
  // Default build is for a web release build.
  grunt.registerTask('default', [
    'shell:clean',
    'sprite',
    'coffee',
    'jasmine_node',
    'shell:compileSFXList',      // todo: remove this when you get audio sprites working? do we even need audio sprites?
    'shell:copySoundManager2SWF',
    'shell:copySounds',
    'requirejs',
    'preprocess:release',
    'zip',
    'unzip',
    //'sftp-deploy',
    'shell:findTodos'
  ]);
};