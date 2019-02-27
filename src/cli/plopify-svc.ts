#!/usr/bin/env node
import * as path from 'path';
import * as program from 'commander';
import axios from 'axios';
import chalk from 'chalk';

import globalConfig from '../lib/global-config';
import {logStatus} from '../util/misc';
const conf = globalConfig(path.resolve(__dirname, '..'));

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));

program
	.command('github-create <name>')
	.description('Creates a remote repository on GitHub with the given name')
	.option('-p --private', 'Whether to make the new repo private')
	.action(async (name, options) => {
		const token = await conf.read('githubPersonalAccessToken');

		try {
			process.stdout.write(`Attempting to create repository: ${name}... `);

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

			logStatus(true);
			console.log('Successfully created', chalk.blue.underline(res.data.clone_url));
		} catch (e) {
			if (e.response) {
				process.stdout.write(chalk.bgRed.bold(' ' + e.response.status + ' ') + ' ');
				switch(e.response.status) {
				case 401:
					console.log('This likely means your GitHub personal access token is invalid.');
					break;
				}

				console.log(chalk.yellow('Additional info:'), e.response.data);
			}

			process.exit(1);
		}
	});

program
	.command('travis-enable <slug>')
	.description('Enables Travis CI for the given repository (equivalent to flicking the switch on the Travis CI dashboard)')
	.option('-r --retries <n>', 'how many times we should ask Travis if it found our new repo before we give up (syncing from GitHub can take time)', parseInt)
	.option('-d --delay <n>', 'how many milliseconds to wait between each retry', parseInt)
	.action(async (slug, options) => {
		const config = await conf.read();
		const token = config.travisCiApiToken;

		const delay: number = options.delay || 1500;
		const retries: number = options.retries || 5;
		let retriesLeft = retries;

		const base = 'https://api.travis-ci.org';
		const reqConfig = {
			// For these requests, we want 404 to be a valid response
			validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
			headers: {
				'Travis-API-Version': 3,
				'User-Agent': 'Plopify',
				'Authorization': 'token ' + token
			}
		};

		try {
			process.stdout.write('Authorizing... ');
			let userInfo = (await axios.get(`${base}/user`, reqConfig)).data;
			logStatus(true);

			process.stdout.write('Syncing Travis CI to GitHub... ');
			await axios.post(`${base}/user/${userInfo.id}/sync`, {}, reqConfig);
			logStatus(true);

			let found: boolean = false;
			while(retriesLeft > 0 && !found) {
				process.stdout.write(`Checking for new repo: ${slug}... `);
				found = (await axios.get(`${base}/repo/${encodeURIComponent(slug)}`, reqConfig)).status !== 404;
				logStatus(found);

				if (!found) {
					retriesLeft --;
					console.log(`Unable to find ${slug}.  Perhaps Travis is not finished syncing.  Retrying... (${retries - retriesLeft}/${retries})`);
					await sleep(delay);
				}
			}

			// If we have exited the while loop and Travis still can't find the repo, something is probably wrong
			if (!found) {
				throw {response: {
					status: 404,
					data: 'Travis CI was unable to to locate ' + slug
				}};
			}

			process.stdout.write(`Enabling Travis CI builds for ${slug}... `);
			await axios.post(`${base}/repo/${encodeURIComponent(slug)}/activate`, {}, reqConfig);
			logStatus(true);
		} catch (e) {
			logStatus(false);

			if (e.response) {
				process.stdout.write(chalk.bgRed.bold(' ' + e.response.status + ' ') + ' ');
				switch(e.response.status) {
				default:
					console.log('We\'re not entirely sure why this error occurred');
					break;
				}

				console.log(chalk.yellow('Additional info:'), e.response.data);
			}

			process.exit(1);
		}
	});

program
	.command('coveralls-enable <slug> [gitprovider]')
	.description('Enables Coveralls for the given repository (equivalent to flicking the switch on the Coveralls dashboard)')
	.action(async (slug, gitprovider = 'github', options) => {
		const config = await conf.read();
		const token = config.coverallsPersonalApiToken;

		const base = 'https://coveralls.io/api';
		const headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'token ' + token
		};
		const data = {
			'repo': {
				'service': gitprovider,
				'name': slug
			}
		};

		try {
			process.stdout.write(`Enabling Coveralls for ${slug}... `);
			await axios.post(`${base}/repos`, data, {headers});
			logStatus(true);
		} catch (e) {
			logStatus(false);

			if (e.response) {
				process.stdout.write(chalk.bgRed.bold(' ' + e.response.status + ' ') + ' ');
				switch(e.response.status) {
				case 403:
					console.log('This likely means your Coveralls Personal API Token is invalid');
					break;
				default:
					console.log('We\'re not entirely sure why this error occurred');
					break;
				}

				console.log(chalk.yellow('Additional info:'), e.response.data);
			}

			process.exit(1);
		}
	});

program.parse(process.argv);

// Simply output help if no subcommand is specified
if (program.args.length === 0) {
	program.outputHelp();
}
