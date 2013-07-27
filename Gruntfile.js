module.exports = function( grunt ) {
  'use strict';
  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig({

    // Project configuration
    // ---------------------

    // specify an alternate install location for Bower
    bower: {
      dir: 'app/components'
    },

    // Coffee to JS compilation
    coffee: {
      compile: {
        files: {
          'app/scripts/*.js': 'app/scripts/**/*.coffee',
          'test/spec/*.js': 'test/spec/**/*.coffee'
        }
      }
    },

    // compile .scss/.sass to .css using Compass
    compass: {
      dist: {
        // http://compass-style.org/help/tutorials/configuration-reference/#configuration-properties
        options: {
          css_dir: 'temp/styles',
          sass_dir: 'app/styles',
          images_dir: 'app/images',
          javascripts_dir: 'temp/scripts',
          force: true
        }
      }
    },

    // generate application cache manifest
    manifest:{
      dest: ''
    },

    // default watch configuration
    watch: {
      coffee: {
        files: 'app/scripts/**/*.coffee',
        tasks: 'coffee reload'
      },
      compass: {
        files: [
          'app/styles/**/*.{scss,sass}'
        ],
        tasks: 'compass reload'
      },
      reload: {
        files: [
          'app/*.html',
          'app/styles/**/*.css',
          'app/scripts/**/*.js',
          'app/views/**/*.html',
          'app/images/**/*'
        ],
        tasks: 'reload'
      }
    },

    // default lint configuration, change this to match your setup:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#lint-built-in-task
    lint: {
      files: [
        'Gruntfile.js',
        'app/scripts/**/*.js',
        'spec/**/*.js'
      ]
    },

    // specifying JSHint options and globals
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        '-W033': true,//Missing semicolon. my test way
        globals: {
          angular: true,
          jQuery: true,
          console: true,
          curaApp: true,
        }
      },
      ignore_warning: {
        options: {
          '-W033': true,//Missing semicolon. Official way, not work
        },
      },
      beforeconcat: ['app/scripts/app.js', 'app/scripts/controllers/main.js'],
      afterconcat: ['dist/output.js']
    },

    // Build configuration
    // -------------------

    // the staging directory used during the process
    staging: 'temp',
    // final build output
    output: 'dist',

    mkdirs: {
      staging: 'app/'
    },

    // Below, all paths are relative to the staging directory, which is a copy
    // of the app/ directory. Any .gitignore, .ignore and .buildignore file
    // that might appear in the app/ tree are used to ignore these values
    // during the copy process.

    // concat css/**/*.css files, inline @import, output a single minified css
    cssmin: {
      minify: {
        src: ['app/styles/application.css'],
        dest: 'app/styles/application.css',
      },
      wpminify: {
        src: ['app/styles/water-quality.css'],
        dest: 'app/styles/water-quality.css',
      }
    },

    // renames JS/CSS to prepend a hash of their contents for easier
    // versioning
    rev: {
      js: 'scripts/**/*.js',
      css: 'styles/**/*.css',
      img: 'images/**'
    },

    // usemin handler should point to the file containing
    // the usemin blocks to be parsed
    'usemin-handler': {
      html: 'index.html'
    },

    // update references in HTML/CSS to revved files
    usemin: {
      html: ['**/*.html'],
      css: ['**/*.css']
    },

    // HTML minification
    html: {
      files: ['**/*.html']
    },

    // Optimizes JPGs and PNGs (with jpegtran & optipng)
    img: {
      dist: '<config:rev.img>'
    },

    // rjs configuration. You don't necessarily need to specify the typical
    // `path` configuration, the rjs task will parse these values from your
    // main module, using http://requirejs.org/docs/optimization.html#mainConfigFile
    //
    // name / out / mainConfig file should be used. You can let it blank if
    // you're using usemin-handler to parse rjs config from markup (default
    // setup)
    rjs: {
      // no minification, is done by the min task
      optimize: 'none',
      baseUrl: './scripts',
      wrap: true
    },
    concat: {
      options: {
        stripBanners: true
      },
      js: {
        options: {
          separator: ';'
        },
        src: [
          'vendor/jquery.js',
          'vendor/jquery-ui/jquery.ui.core.js',
          'vendor/jquery-ui/jquery.ui.widget.js',
          'vendor/jquery-ui/jquery.ui.position.js',
          'vendor/jquery-ui/jquery.ui.button.js',
          'vendor/jquery-ui/jquery.ui.mouse.js',
          'vendor/jquery-ui/jquery.ui.slider.js',
          'vendor/jquery-ui/jquery.ui.draggable.js',
          'vendor/jquery-ui/jquery.ui.dialog.js',
          'vendor/jquery-ui/jquery.ui.mouse.js',
          'vendor/jquery-ui/jquery.ui.sortable.js',
          'vendor/jquery-ui/jquery.ui.datepicker.js',
          'vendor/jquery-ui-timepicker-addon.js',
          'vendor/jquery-validation/jquery.validate.js',
          'vendor/jquery-validation/additional-methods.js',
          'vendor/jquery.tablesorter/jquery.tablesorter.js',
          'vendor/jquery.tablesorter/addons/pager/jquery.tablesorter.pager.js',
          'vendor/jquery-file-upload/jquery.iframe-transport.js',
          'vendor/jquery-file-upload/jquery.fileupload.js',
          'vendor/ucsv.js',
          'vendor/bootstrap/js/bootstrap-typeahead-2.1.0-customized.js',
          'vendor/bootstrap/js/bootstrap-affix.js',
          'app/scripts/vendor/leaflet.js',
          'app/scripts/curah2o/cura.leaflet.js',
          'app/scripts/curah2o/cura.leaflet.geojson.js',
          'app/scripts/vendor/angular.js',
          'app/scripts/vendor/angular-cookies.js',
          'app/scripts/vendor/angular-resource.js',
        ],
        dest: 'app/scripts/application.js'
      },
      wpjs: {
        options: {
          separator: ';'
        },
        src: [
          'vendor/jquery-ui-timepicker-addon.js',
          'vendor/jquery-validation/jquery.validate.js',
          'vendor/jquery-validation/additional-methods.js',
          'vendor/jquery.tablesorter/jquery.tablesorter.js',
          'vendor/jquery.tablesorter/addons/pager/jquery.tablesorter.pager.js',
          'vendor/jquery-file-upload/jquery.iframe-transport.js',
          'vendor/jquery-file-upload/jquery.fileupload.js',
          'vendor/ucsv.js',
          'vendor/bootstrap/js/bootstrap-typeahead-2.1.0-customized.js',
          'vendor/bootstrap/js/bootstrap-affix.js',
          'app/scripts/vendor/leaflet.js',
          'app/scripts/curah2o/cura.leaflet.js',
          'app/scripts/curah2o/cura.leaflet.geojson.js',
          'app/scripts/vendor/angular.js',
          'app/scripts/vendor/angular-cookies.js',
          'app/scripts/vendor/angular-resource.js',
        ],
        dest: 'app/scripts/water-quality.js'
      },
      css: {
        options: {
          separator: '\n',
        },
        src: [
          'app/styles/jquery-ui.css',
          'app/styles/leaflet.awesome-markers.css',
          'app/styles/MarkerCluster.Default.css',
          'app/styles/MarkerCluster.css',
          'app/styles/font-awesome.min.css',
          'app/styles/leaflet.css',
        ],
        dest: 'app/styles/application.css'
      },
      wpcss: {
        options: {
          separator: '\n',
        },
        src: [
          'app/styles/leaflet.css',
          'app/styles/leaflet.awesome-markers.css',
          'app/styles/MarkerCluster.Default.css',
          'app/styles/MarkerCluster.css',
          'app/styles/font-awesome.min.css',
        ],
        dest: 'app/styles/water-quality.css'
      }
    },
    uglify: {
      js: {
        files: {
          'app/scripts/application.js': ['app/scripts/application.js']
        }
      },
      wpjs: {
        files: {
          'app/scripts/water-quality.js': ['app/scripts/water-quality.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Alias the `test` task to run `testacular` instead
  grunt.registerTask('test', 'run the testacular test driver', function () {
    var done = this.async();
    require('child_process').exec('testacular start --single-run', function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });

  grunt.registerTask('debug', ['concat:css', 'concat:js']);
  grunt.registerTask('wpdebug', ['concat:wpcss', 'concat:wpjs']);
  
  grunt.registerTask('wp', ['concat:wpcss', 'cssmin:wpminify', 'concat:wpjs', 'uglify:wpjs']);
  grunt.registerTask('default', ['concat:css', 'cssmin:minify', 'concat:js', 'uglify:js']);
};
