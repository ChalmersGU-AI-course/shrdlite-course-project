module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    typescript:
      default:
        src: 'shrdlite-html.ts'
        dest: 'shrdlite-html.js'
        options:
          module: 'amd'
          target: 'es5'
          sourceMap: true
          declarations: false
          references: [
            'lib/*.d.ts'
          ]
      offline:
        src: 'shrdlite-offline.ts'
        dest: 'shrdlite-offline.js'
        options:
          module: 'amd'
          target: 'es5'
          sourceMap: true
          declarations: false
          references: [
            'lib/*.d.ts'
          ]
    shell:
      nearleyc:
        command: 'nearleyc grammar.ne > grammar.js'
        
    watch:
      files: [ '*.ts' ]
      tasks: [ 'default' ]

  grunt.loadNpmTasks 'grunt-typescript'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-shell'

  grunt.registerTask 'default', ['typescript:default', 'shell:nearleyc']
  grunt.registerTask 'offline', ['typescript:offline', 'shell:nearleyc']