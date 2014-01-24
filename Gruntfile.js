module.exports = function(grunt) {
  
  var coffeeSourceFiles = [
    'coffee/*.coffee',
    'coffee/util/*.coffee',
    'coffee/atom/*.coffee',
    'coffee/UI/*.coffee',
    'coffee/Battle/*.coffee',
    'coffee/Battle/gameplay/*.coffee',
    'coffee/Battle/Pawn/*.coffee',
    'coffee/Battle/UI/*.coffee',
    'coffee/Battle/View/*.coffee'
  ];
  
  var gfxFiles = [
    './gfx/MainMenu/',
    './gfx/ammodump/',
    './gfx/ammodumpsmall/',
    './gfx/barracks/',
    './gfx/chemcloud/',
    './gfx/chemmine/',
    './gfx/commcenter/',
    './gfx/commrelay/',
    './gfx/depot/',
    './gfx/engineerinfantry/',
    './gfx/explosion0/',
    './gfx/explosion1/',
    './gfx/explosion2/',
    './gfx/explosion3/',
    './gfx/firesmall0/',
    './gfx/firesmall1/',
    './gfx/firetiny0/',
    './gfx/firetiny1/',
    './gfx/firetiny2/',
    './gfx/heli/',
    './gfx/helipad/',
    './gfx/mine/',
    './gfx/missilegray/',
    './gfx/missilepurple/',
    './gfx/missilerack/',
    './gfx/missileracksmall/',
    './gfx/missilered/',
    './gfx/pillbox/',
    './gfx/pistolinfantry/moving/',
    './gfx/pistolinfantry/attack_standing',
    './gfx/pistolinfantry/attack_crouching/',
    './gfx/pistolinfantry/attack_prone/',
    './gfx/pistolinfantry/death1/',
    './gfx/pistolinfantry/death2/',
    './gfx/rocketinfantry/moving/',
    './gfx/rocketinfantry/attack_standing',
    './gfx/rocketinfantry/attack_crouching/',
    './gfx/rocketinfantry/attack_prone/',
    './gfx/rocketinfantry/death1/',
    './gfx/rocketinfantry/death2/',
    './gfx/engineerinfantry/moving/',
    './gfx/engineerinfantry/death1/',
    './gfx/engineerinfantry/death2/',    
    './gfx/pistolshell/',
    './gfx/repairbay/',
    './gfx/rocketinfantry/',
    './gfx/rocketshell/',
    './gfx/scaffold/',
    './gfx/smokelarge/',
    './gfx/smokesmall/',
    './gfx/turret/',
    './gfx/turretshell/',
    './gfx/watchtower/'
  ];
  
  gfxFiles.push('./gfx/');
  for (var i=gfxFiles.length; i-->0;) {
    gfxFiles[i] += '*.png';
  }
  
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
          almond: true,
          optimize: "none", //"uglify",
          baseUrl: "./",
          name: "lib/almond.js",
          wrap:true,
          include: [
            "core/init"
          ],
          insertRequire: ["core/init"],
          out: "core/<%= pkg.name %>.min.js",
          paths: {
            "text" : "lib/text"
          }
        }
      }
    },
    
    sprite: {
      all: {
        src: gfxFiles,
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
  grunt.loadNpmTasks('grunt-sftp-deploy');
  
  grunt.registerTask('test',    ['shell:clean', 'coffee', 'jasmine_node']);
  
  // Default build is for a web release build.
  grunt.registerTask('default', [
    'shell:clean',
    'sprite',
    'coffee',
    'jasmine_node',
    'shell:compileSFXList',
    'shell:copySounds',
    'requirejs',
    //'preprocess:release',
    'zip',
    'unzip',
    //'sftp-deploy',
    'shell:findTodos'
  ]);
};