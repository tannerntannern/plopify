export default {
	'init': {
		usage: '<dir>',
		description: 'Generates some starter code to kickstart your template (a "template for your template," if you will)',
	},
	'gen': {
		usage: '<template> <outdir>',
		description: 'Generates a new project based on the given template'
	},
	'update': {
		usage: 'update [project]',
		description: 'Updates an existing project based on changes from the template'
	},
	'config': {
		usage: '<action> [key] [value]',
		description: 'Displays or modifies the content of plopify\'s global config data'
	},
	'svc': {
		usage: '<service>',
		description: 'Calls one of plopify\'s services, such as initializing a remote repo on GitHub'
	}
} as {
	[name: string]: {
		usage: string,
		description: string,
	}
};
