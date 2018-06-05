
module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            name: small,
            width: 480,
            suffix: '',
            quality: 25
          }], 
          // overwrite: true  by default
        },
        files: [{
          expand: true,
          cwd: 'img/', //change working dir
          src: ['restaurant.png'],
          dest: 'img/'
        }]
      }
    },

    clean: {
      dev: {
        src: ['img_r'],
      },
    },

    mkdir: {
      dev: {
        options: {
          create: ['img_r']
        },
      },
    },

    copy: {
      dev: {
        files: [{
          expand: true,
          src: ['img_r/fixed/*.{gif,jpg,png}'],
          dest: 'img_r/',
          flatten: true,
        }]
      },
    },

  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', ['responsive_images']);

};
