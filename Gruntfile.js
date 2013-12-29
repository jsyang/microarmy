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
      
    }
    
  };
  
  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  // todo: add tests as a grunt task
  // todo: compile gfx assets into sprite sheet
  
  grunt.registerTask('default', ['shell:clean', 'coffee', 'uglify', 'shell:compileGFXList', 'shell:compileSFXList']);
};