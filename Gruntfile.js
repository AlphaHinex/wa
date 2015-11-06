'use strict';

module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {
    configureProxies: 'grunt-connect-proxy'
  });

  // Configurable paths for the application
  var appConfig = {
    src: 'src',
    test: 'test',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    app: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: [
          '<%= app.src %>/**/*.js'
        ],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '.tmp/styles/**/*.css',
          '<%= app.src %>/**/*.html',
          '<%= app.src %>/**/*.css',
          '<%= app.src %>/images/**/*.{pgn,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      proxies: [
        {
          context: '/api',
          host: 'localhost',
          port: 8080
        }
      ],
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= app.src %>'
          ],
          middleware: function (connect, options) {
            // Setup the proxy
            var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

            // Serve static files
            options.base.forEach(function(base) {
              middlewares.push(connect.static(base));
            });
            middlewares.push(connect().use('/bower_components', connect.static('./bower_components')));
            middlewares.push(connect.static(appConfig.src));

            return middlewares;
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= app.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= app.src %>/**/*.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= app.dist %>/**/*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= app.src %>/index.html'],
        ignorePath:  /\.\.\//
      }
    },

    concat: {
      build: {
        files: [{
          '.tmp/app.js': ['<%= app.src %>/**/*.js'],
          '.tmp/app.css': ['<%= app.src %>/**/*.css'],
          '<%= app.dist %>/app.css': ['<%= app.src %>/**/*.css']
        }]
      },
      dist: {
        files: [{
          '.tmp/app.js': ['<%= app.src %>/**/*.js'],
          '.tmp/app.css': ['<%= app.src %>/**/*.css'],
          '<%= app.dist %>/app.css': ['<%= app.src %>/**/*.css']
        }]
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      build: {
        src: ['.tmp/app.js'],
        dest: '<%= app.dist %>/app.js'
      },
      dist: {
        src: ['.tmp/app.js'],
        dest: '.tmp/app.js'
      }
    },

    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp',
          src: ['app.js'],
          dest: '<%= app.dist %>'
        }]
      }
    },

    cssmin: {
      dist: {
        files: {
          '<%= app.dist %>/app.css': [
            '.tmp/app.css'
          ]
        }
      }
    }

  });

  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'configureProxies:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', ['clean', 'wiredep', 'concat:build', 'ngAnnotate:build']);

  grunt.registerTask('default', ['clean', 'wiredep', 'concat:dist', 'ngAnnotate:dist', 'uglify', 'cssmin']);

};
