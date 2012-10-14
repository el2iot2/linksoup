module.exports = function (grunt) {
	
	// Project configuration.
	grunt.initConfig({
		pkg : '<json:package.json>',
		meta : {
			banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		min : {
			dist : {
				src : ['<banner:meta.banner>', 'lib/<%= pkg.name %>.js'],
				dest : 'dist/<%= pkg.name %>.min.js'
			}
		},
		lint : {
			files : ['grunt.js', 'lib/**/*.js', 'spec/**/*.js']
		},
		watch : {
			files : '<config:lint.files>',
			tasks : 'default'
		},
		jshint : {
			options : {
				curly : true,
				eqeqeq : true,
				immed : true,
				latedef : true,
				newcap : true,
				noarg : true,
				sub : true,
				undef : true,
				boss : true,
				eqnull : true,
				node : true
			},
			globals : {
				exports : true,
				expect : true,
				it : true,
				describe: true,
				beforeEach: true
			}
		}
	});
	
	// Default task.
	grunt.registerTask('default', 'lint min');
	
};