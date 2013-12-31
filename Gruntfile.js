module.exports = function(grunt) {
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'core/<%= pkg.name %>.js',
        dest: 'core/<%= pkg.name %>.min.js'
      }
    },
    
    coffee: {
      compile: {
        options : {
          bare      : true,
          join      : true,
          sourceMap : true
        },
        files: {
          'core/<%= pkg.name %>.js' : 'coffee/*.coffee'
        }
      },
      transpile: { // to JS, but don't join the files together
        options : {
          bare      : true
        },
        files: grunt.file.expandMapping([
          'coffee/*.coffee',
          'coffee/util/*.coffee',
          'coffee/Battle/*.coffee',
          'coffee/Battle/gameplay/*.coffee',
          'coffee/Battle/Pawn/*.coffee',
          'coffee/Battle/ui/*.coffee',
          'coffee/Battle/view/*.coffee'
        ],
          'tmp/',
        {
          rename: function(destBase, destPath) {
            //            "tmp/"     "coffee/game.coffee"
            var newName = destBase + destPath.replace(/\.coffee$/,".js").replace(/^coffee\//,"");
            return newName;
          }
        })
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
      },
      deleteTmp: {
        command : "rm -rf ./tmp"
      }
      
    },
    
    jasmine_node: {
      useCoffee: true,
      verbose: true,
      extensions: "coffee",
      projectRoot: "./tests/",
      requirejs: true
    }
    
  };
  
  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  
  // todo: compile gfx assets into sprite sheet
  
  grunt.registerTask('clean', ['shell:clean', 'shell:deleteTmp']);
  grunt.registerTask('test', ['coffee:transpile', 'jasmine_node', "shell:deleteTmp"]);
  grunt.registerTask('default', ['shell:clean', 'coffee:compile', 'uglify', 'shell:compileGFXList', 'shell:compileSFXList']);
};