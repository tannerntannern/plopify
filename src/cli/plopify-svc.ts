#!/usr/bin/env node
import * as path from 'path';
import * as program from 'commander';
import axios from 'axios';
import chalk from 'chalk';

import globalConfig from '../lib/global-config';

// Where the dist directory is from this file
const distDir = path.resolve(__dirname, '..');

program
	.command('github-create <name>')
	.option('-p --private', 'Whether to make the new repo private')
	.action(async (name, options) => {
		const token = await globalConfig(distDir).read('githubPersonalAccessToken');

		try {
			console.log('Attempting to create repository:', name);

			let res = await (axios.request({
				method: 'POST',
				url: 'https://api.github.com/user/repos',
				headers: {
					'Authorization': 'token ' + token,
				},
				data: {
					name: name,
					private: options.private
				}
			}));

			console.log('Successfully created', chalk.blue.underline(res.data.clone_url));

			return;
		} catch (e) {
			if (e.response) {
				process.stdout.write(chalk.bgRed.bold(' ' + e.response.status + ' ') + ' ');
				switch(e.response.status) {
				case 401:
					console.log('This likely means your GitHub personal access token is invalid.');
					break;
				}
			}

			throw e;
		}
	});

program.parse(process.argv);

// Simply output help if no subcommand is specified
if (program.args.length === 0) {
	program.outputHelp();
}
