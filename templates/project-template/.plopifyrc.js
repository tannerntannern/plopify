module.exports = {
	prompts: [{
		name: 'project_name',
		message: 'Project name?',
		validate: (input) => /^[a-z0-9\-]+$/.test(input) ? true : 'Must be a dash-case-name'
	}, {
		name: 'project_repository',
		message: 'Project repository?'
	}, {
		name: 'author_name',
		message: 'Author Name?',
	}, {
		name: 'author_email',
		message: 'Author Email?',
		validate: (input) => /^[^@]+@[^.]+\..+$/.test(input) ? true : 'Please enter a valid email address'
	}],
	updatePolicies: [{
		type: 'ignore',
		includeFileContent: '.gitignore',
		files: [
			'package-lock.json',
			'yarn.lock'
		]
	}],
	hooks: {

	}
};