module.exports = function(grunt) {
  
  // Keep all the Pawn constructor names, needed in Pawn.getName()
  var RESERVED_CLASS_NAMES = [
    'Structure',
    'CommCenter',
    'Barracks',
    'Scaffold',
    'CommRelay',
    'WatchTower',
    'AmmoDump',
    'AmmoDumpSmall',
    'MineFieldSmall',
    'Depot',
    'RepairYard',
    'Helipad',
    'Pillbox',
    'SmallTurret',
    'MissileRack',
    'MissileRackSmall',
    'Projectile',
    'Bullet',
    'MGBullet',
    'SmallRocket',
    'SmallShell',
    'SmallMine',
    'SmallChemMine',
    'HomingMissile',
    'HomingMissileSmall',
    'MediumRocketHE',
    'Infantry',
    'PistolInfantry',
    'RocketInfantry',
    'EngineerInfantry',
    'Explosion',
    'FragExplosion',
    'SmallExplosion',
    'FlakExplosion',
    'HEAPExplosion',
    'ChemExplosion',
    'SmokeCloud',
    'SmokeCloudSmall',
    'Flame',
    'ChemCloud',
    '$'
  ];
  
  // todo: Reserved method names (not to be mangled by Uglify).
  // Mangle everything else.
  
  var coffeeSourceFiles = [
    'coffee/*.coffee',
    'coffee/util/*.coffee',
    'coffee/atom/*.coffee',
    'coffee/UI/*.coffee',
    'coffee/Battle/*.coffee',
    'coffee/Battle/mode/*.coffee',
    'coffee/Battle/Pawn/*.coffee',
    'coffee/Battle/UI/*.coffee'
  ];
  
  var gfxFiles = [
    './gfx/',
    './gfx/MainMenu/',
    './gfx/aircraftbomb/',
    './gfx/ammodump/',
    './gfx/ammodumpsmall/',
    './gfx/battleui/',
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
    './gfx/pistolinfantry/attack_standing/',
    './gfx/pistolinfantry/attack_crouching/',
    './gfx/pistolinfantry/attack_prone/',
    './gfx/pistolinfantry/death1/',
    './gfx/pistolinfantry/death2/',
    './gfx/pistolinfantry/idle/',
    './gfx/rocketinfantry/moving/',
    './gfx/rocketinfantry/attack_standing/',
    './gfx/rocketinfantry/attack_crouching/',
    './gfx/rocketinfantry/attack_prone/',
    './gfx/rocketinfantry/death1/',
    './gfx/rocketinfantry/death2/',
    './gfx/rocketinfantry/idle/',
    './gfx/engineerinfantry/moving/',
    './gfx/engineerinfantry/death1/',
    './gfx/engineerinfantry/death2/',
    './gfx/engineerinfantry/idle/',
    './gfx/pistolshell/',
    './gfx/smalljet/',
    './gfx/repairbay/',
    './gfx/rocketinfantry/',
    './gfx/rocketshell/',
    './gfx/scaffold/',
    './gfx/smalltree/',
    './gfx/bigtree/',
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
    "index.html",
    "core/timestamp.txt"
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
      // Removes the requirejs/text dependency since we build the module ourself.
      createSFXINFO : {
        command : [
          'sed \'s/^/\\"/\'  ./core/RESOURCES_SND.txt > ./core/tmp_SFXINFO.txt',
          'sed \'s/$/\\",/\' ./core/tmp_SFXINFO.txt > ./core/_SFXINFO.txt',
          'echo "define(function(){return [" > ./core/SFXINFO.js',
          'cat ./core/_SFXINFO.txt >> ./core/SFXINFO.js',
          'echo "];});" >> ./core/SFXINFO.js'
        ].join(' ; ')
      },
      // Removes the requirejs/text dependency since we build the module ourself.
      createGFXINFO : {
        command : [
          'echo "define(function(){window.GFXINFO=" > ./core/GFXINFO.js',
          'cat ./core/spritesheet.json >> ./core/GFXINFO.js',
          'echo ";});" >> ./core/GFXINFO.js'
        ].join(' ; ')
      },
      compileSFXList: {
        command : "ls -1 ./core/snd | sed -e 's/\\.[a-zA-Z]*$//' > ./core/RESOURCES_SND.txt"
      },
      dateStampBuild : {
        command : "date +%Y.%m.%d-%R > ./core/timestamp.txt"
      },
      copySounds: {
        command : [
          'mkdir ./core/snd',
          'cp ./snd/* ./core/snd'
        ].join(' ; ')
      },
      renameCopiedSounds : {
        command : [
          "find ./core/snd -type f -name '*.mp3' | while read f; do mv \"$f\" \"${f%.mp3}\"; done", // node-webkit is not built with an MP3 decoder! fuck!
          "find ./core/snd -type f -name '*.wav' | while read f; do mv \"$f\" \"${f%.wav}\"; done",
          "find ./core/snd -type f -name '*.ogg' | while read f; do mv \"$f\" \"${f%.ogg}\"; done"
        ].join(' ; ')
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
      },
      
      copyNodeWebkitManifest : {
        command : 'cp ./nodewebkit/* ./dist'
      },
      
      deleteDistZip : {
        command : 'rm ./dist/*.zip'
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
          optimize: "none",
          baseUrl: "./",
          name: "lib/almond.js",
          wrap:true,
          include: [
            "core/init"
          ],
          insertRequire: ["core/init"],
          out: "core/<%= pkg.name %>.min.js",
        }
      },
      // todo: More work on uglify options.
      // We want to use the compressor in a better way.
      compileUglify : {
        options: {
          almond: true,
          optimize: "uglify2",
          uglify2: {
            mangle: {
              except: RESERVED_CLASS_NAMES
            }
          },
          baseUrl: "./",
          name: "lib/almond.js",
          wrap:true,
          include: ["core/init"],
          insertRequire: ["core/init"],
          out: "core/<%= pkg.name %>.min.js",
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
    },
    
    nodewebkit: {
      options: {
        version : '0.9.0-rc1',
        //timestamped_builds : true,
        mac : true,
        win : false,
        build_dir : './build'
      },
      src: './dist/**/*'
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
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  
  // Default build is for a web release build.
  grunt.registerTask('default', [
    'shell:clean',
    'sprite',
    'coffee',
    'jasmine_node',
    'shell:copySounds',
    'shell:renameCopiedSounds',
    'shell:compileSFXList',
    'shell:createGFXINFO',
    'shell:createSFXINFO',
    'requirejs:compile',
    'shell:dateStampBuild',
    'zip',
    'unzip',
    'shell:findTodos'
  ]);
  
  // Build for node-webkit
  grunt.registerTask('release', [
    'shell:clean',
    'sprite',
    'coffee',
    'jasmine_node',
    'shell:copySounds',
    'shell:renameCopiedSounds',
    'shell:compileSFXList',
    'shell:createGFXINFO',
    'shell:createSFXINFO',
    'requirejs:compileUglify',
    'shell:dateStampBuild',
    'zip',
    'unzip',
    'shell:findTodos',
    'shell:copyNodeWebkitManifest',
    'shell:deleteDistZip',
    'nodewebkit'
  ]);
};