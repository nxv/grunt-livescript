/*
 * grunt-livescript
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 David Souther, contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  grunt.registerMultiTask('livescript', 'Compile LiveScript files into JavaScript', function() {
    var path = require('path');

    var options = this.options({
      bare: false,
      basePath: false,
      flatten: false,
      separator: grunt.util.linefeed,
      process: false,
      noProcess: []
    });

    grunt.verbose.writeflags(options, 'Options');

    var basePath;
    var newFileDest;

    var srcFiles;
    var srcCompiled;
    var taskOutput;

    this.files.forEach(function(file) {
      var output = file.src.filter(function(srcpath) {
        if (!grunt.file.exists(srcpath)) {
          grunt.og.warn('Source file "' + srcpath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(srcpath) {
        var contents = compile(srcpath, options);
        var process = options.process && options.noProcess !== true &&
            !(options.noProcess && grunt.file.isMatch(options.noProcess, srcpath));
        if (process) {
          grunt.verbose.write('Processing source...');
          try {
            contents = options.process(contents, srcpath, file.dest);
            grunt.verbose.ok();
          } catch(e) {
            grunt.verbose.error();
            throw grunt.util.error('Error while processing "' + srcpath + '" file.', e);
          }
        }
        return contents;
      }).join(grunt.util.normalizelf(options.separator));

      if (output.length < 1) {
        grunt.log.warn('Destination not written because compiled files were empty.');
      } else {
        grunt.file.write(file.dest, output);
        grunt.log.writeln('File ' + file.dest.cyan + ' created.');
      }
    });
  });

  var compile = function(srcFile, options) {
    options = grunt.util._.extend({filename: srcFile}, options);
    delete options.basePath;
    delete options.flatten;

    var srcCode = grunt.file.read(srcFile);

    try {
      return require('LiveScript').compile(srcCode, options);
    } catch (e) {
      grunt.log.error(e);
      grunt.fail.warn('LiveScript failed to compile.');
    }
  };
};
