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
      astarLab:
        src: 'AstarLab.ts'
        dst: 'AstarLab.js'
        options:
          module: 'amd'
          target: 'es5'
          sourceMap: false
          declarations: false
          references: [
          ]
      tests:
        src: 'tests/*.ts'
        dst: 'tests/'
        
    shell:
      nearleyc:
        command: 'nearleyc grammar.ne > grammar.js'

    mocha:
      astarLab:
        src: [ 'tests/astarlab_runner.html' ]
        options:
          run: true

        
    watch:
      files: [ '*.ts' ]
      tasks: [ 'default' ]

  grunt.loadNpmTasks 'grunt-typescript'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-shell'
  grunt.loadNpmTasks 'grunt-mocha'

  grunt.registerTask 'default', ['typescript:astarLab', 'typescript:default', 'shell:nearleyc']
  grunt.registerTask 'offline', ['typescript:offline', 'shell:nearleyc']
  grunt.registerTask 'astarLab', ['typescript:astarLab', 'typescript:tests', 'mocha:astarLab']