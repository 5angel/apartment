module.exports = function(grunt) {
  var SOURCE = 'src/js/',
      NAMES  = ['common', 'spriteSheet', 'gameObject', 'room', 'main'],
	  FILES  = NAMES.map(function (name) { return SOURCE + name + '.js'});

  // configure the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: {
        src: [ 'dist/' ]
      }
    },
	copy: {
      files: {
        cwd: 'src/i/',
        src: '**/*',
        dest: 'dist/i',
        expand: true
      }
	},
    concat: {
      dist: {
        src: [
		  'src/js/app/common.js',
		  'src/js/classes/richHTMLElement.js',
		  'src/js/classes/spritesheet.js',
		  'src/js/classes/gameObject.js',
		  'src/js/classes/*.js',
		  'src/js/app/main.js',
		  'src/js/**/*.js'
		],
        dest: 'dist/js/app.js',
      },
    },
    uglify: {
      my_target: {
        files: {
          'dist/js/app.min.js': ['dist/js/app.js']
        }
      }
    },
    less: {
      development: {
        options: {
          paths: ['assets/css']
        },
        files: {
          'dist/css/styles.css': 'src/less/styles.less'
        }
      },
      production: {
        options: {
          paths: ['assets/css'],
          cleancss: true
        },
        files: {
          'dist/css/styles.min.css': 'src/less/styles.less'
        }
      }
    }
  });
 
  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
 
  // define the tasks
  grunt.registerTask('default', [ 'clean', 'copy', 'concat', 'uglify', 'less']);
};