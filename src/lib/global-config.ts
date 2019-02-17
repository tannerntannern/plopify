import * as fs from 'fs';
import * as path from 'path';
import * as Cryptr from 'cryptr';
import * as bcrypt from 'bcrypt';
import {TypeOf} from 'io-ts';
import loader from 'rc.ts';
import {prompt} from 'inquirer';
import chalk from 'chalk';
import {GlobalConfigSchema} from '../schemas';

/**
 * Quick, dirty utility to convert 'camelCase' to 'non case'.
 */
const unCamel = (input: string) => input.replace(/([A-Z])/g, ' $1').toLowerCase();

/**
 * Quick, dirty utility to get confirmation from the user.
 */
const confirm = async (message: string): Promise<boolean> => (await prompt([{
	type: 'confirm',
	name: 'confirmation',
	message: message
}]) as any).confirmation;

/**
 * Collects a confirmed password from the user, recursively restarting until they don't fuck it up.
 */
const collectPassword = async (): Promise<string> => {
	const passwordData: {password: string, password_confirm: string} = await prompt([{
		type: 'password',
		name: 'password',
		mask: '*',
		message: 'Enter a password (note there is no password recovery):'
	}, {
		type: 'password',
		name: 'password_confirm',
		mask: '*',
		message: 'Confirm password:'
	}]);

	if (passwordData.password !== passwordData.password_confirm) {
		console.log('The password confirmation does not match.  Please try again.');
		return collectPassword();
	} else {
		return passwordData.password;
	}
};

/**
 * Gets a password from the user without confirmation using a custom message.
 */
const getPassword = async (message: string = 'Please enter your password:'): Promise<string> => {
	return (await prompt([{
		type: 'password',
		name: 'password',
		mask: '*',
		message: message
	}]) as any).password;
};

/**
 * Allows the user to check their password against the given hash and keep retrying until they get it right.  Returns
 * the correct password once it has been found.
 */
const guessAndCheckPassword = async (passwordHash: string): Promise<string> => {
	let password: string = await getPassword();
	while (!await bcrypt.compare(password, passwordHash)) {
		password = await getPassword('Incorrect password. Try again:');
	}

	return password;
};

/**
 * Configuration manager for plopify with built-in password protection.
 */
export default function (base: string) {
	const file = path.resolve(base, 'plopify-config.json');

	// Writes a fresh copy of the config data to a file.
	const saveConfig = (data: TypeOf<typeof GlobalConfigSchema>) => {
		fs.writeFileSync(file, JSON.stringify(GlobalConfigSchema.encode(data), null, 2));
	};

	// Quick helper for loading the config
	const loadConfig = () => loader(GlobalConfigSchema).loadConfigFile(file);

	return {
		async init() {
			if (fs.existsSync(file)) {
				throw new Error(
					chalk.yellow('Warning: ') + 'Config file already exists.  If you want to modify it, run `' +
					chalk.yellow('plopify config set <key> <value>') + '`.  To blow it up and start over, first run `' +
					chalk.yellow('plopify config flush') + '`'
				);
			}

			// Ask if the user wants password protection
			const usePassword = await confirm('Do you want to password-protect your data?');

			// Collect as password if the user wants one
			let password = '';
			if (usePassword) password = await collectPassword();

			// Then build a list of prompts based on the schema
			const prompts = Object.keys(GlobalConfigSchema.props).filter(key => key !== 'password').map(key => ({
				name: key,
				message: 'Enter your ' + chalk.yellow(unCamel(key)) + ' (leave blank if you wish):'
			}));

			// Collect user answers
			const answers: TypeOf<typeof GlobalConfigSchema> = await prompt(prompts);

			// Encrypt if necessary
			if (password !== '') {
				const cryptr = new Cryptr(password);
				for (let key in answers) {
					answers[key] = cryptr.encrypt(answers[key]);
				}
				answers.password = await bcrypt.hash(password, 10);
			} else {
				answers.password = '';
			}

			// Save and give message
			saveConfig(answers);
			console.log('Config initialized at ' + chalk.blue.underline(file));
		},
		async view() {
			if (!fs.existsSync(file)){
				throw new Error('No config file exists.  Run `' + chalk.yellow('plopify config init') + '` to generate one.');
			}

			let config = loadConfig();
			const hash = config.password;
			delete config.password;

			if (hash !== '') {
				const cryptr = new Cryptr(await guessAndCheckPassword(hash));
				for (let key in config) {
					config[key] = cryptr.decrypt(config[key]);
				}
			}

			console.log(JSON.stringify(config, null, 2));
		},
		where() {
			if (fs.existsSync(file)){
				console.log(file);
			} else {
				throw new Error('No config file exists.  Run `' + chalk.yellow('plopify config init') + '` to generate one.');
			}
		},
		async flush() {
			if (!fs.existsSync(file)) {
				throw new Error('No config file exists');
			} else if (await confirm('This will erase all plopify config data.  Are you sure you want to do this?')) {
				fs.unlinkSync(file);
				console.log(chalk.blue.underline(file), 'has been deleted.');
			}
		},
		async set(key, value) {
			if (!fs.existsSync(file)){
				throw new Error('No config file exists.  Run `' + chalk.yellow('plopify config init') + '` to generate one.');
			}

			// Determine which key to set
			const validKeys = Object.keys(GlobalConfigSchema.props).filter(prop => prop !== 'password');
			if (!key) {
				key = (await prompt([{
					type: 'list',
					name: 'key',
					message: 'Which property do you want to set?',
					choices: validKeys
				}]) as any).key;
			} else if (validKeys.indexOf(key) === -1) {
				throw new Error('Invalid property: must be one of the following: ' + validKeys.join(','));
			}

			// Ask for a value if one was not provided
			if (!value) {
				value = (await prompt([{
					name: 'value',
					message: 'Enter a value for ' + chalk.yellow(key) + ':'
				}]) as any).value;
			}

			// Load and patch the config
			let config = loadConfig();
			if (config.password === '') {
				config[key] = value;
			} else {
				const cryptr = new Cryptr(await guessAndCheckPassword(config.password));
				config[key] = cryptr.encrypt(value);
			}

			saveConfig(config);

			console.log('Changes saved to', chalk.blue.underline(file));
		}
	};
}
