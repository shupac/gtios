module.exports = function (grunt) {
  grunt.initConfig({
    copy: {
      main: {
        files: [
          // includes files within path
          // {expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'},

          // includes files within path and its sub-directories
          {expand: true, src: ['./**'], 
          dest: '../../../../mobile'},

          // makes all src relative to cwd
          // {expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-copy');
};
