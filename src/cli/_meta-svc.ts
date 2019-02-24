export default {
	'github-create': {
		usage: '<name>',
		description: 'Creates a remote repository on GitHub via the GitHub API',
	}
} as {
	[name: string]: {
		usage: string,
		description: string,
	}
};
