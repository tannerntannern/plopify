import * as fs from 'fs';
import * as path from 'path';
import * as Cryptr from 'cryptr';
import * as bcrypt from 'bcrypt';
import {TypeOf} from 'io-ts';
import loader from 'rc.ts';
import {prompt} from 'inquirer';
import chalk from 'chalk';

import {VisibleGlobalConfigSchema, GlobalConfigSchema} from '../schemas';
import {confirm, guessAndCheckPassword, collectPassword} from './prompts';

type Schema = TypeOf<typeof GlobalConfigSchema>;
type VisibleSchema = TypeOf<typeof VisibleGlobalConfigSchema>;
type ConfigKey = keyof VisibleSchema;

// Keys within the GlobalConfigSchema that the user has access to directly modify
const configKeys = <ConfigKey[]> Object.keys(VisibleGlobalConfigSchema.props);

/**
 * Given a full config object, returns a copy that only contains the parts the user needs to see.
 */
const visibleSchema = (config: Schema): VisibleSchema => {
	const result = {};
	for (let key of configKeys) result[key] = config[key];
	return result as VisibleSchema;
};

/**
 * Quick, dirty utility to convert 'camelCase' to 'non case'.
 */
const unCamel = (input: string) => input.replace(/([A-Z])/g, ' $1').toLowerCase();

/**
 * Configuration manager for plopify with built-in password protection.
 */
export default function (base: string) {
	const file = path.resolve(base, 'plopify-config.json');

	// Writes a fresh copy of the config data to a file.
	const saveConfig = async (data: Schema, password: string) => {
		// Encrypt if necessary
		if (password !== '') {
			const cryptr = new Cryptr(password);
			for (let key in data) {
				data[key] = cryptr.encrypt(data[key]);
			}
			data.password = await bcrypt.hash(password, 10);
		} else {
			data.password = '';
		}

		fs.writeFileSync(file, JSON.stringify(GlobalConfigSchema.encode(data), null, 2));
	};

	// Quick helper for loading the config, decrypting if necessary
	const loadConfig = async (decrypt: boolean = true) => {
		let config = loader(GlobalConfigSchema).loadConfigFile(file);
		const hash = config.password;

		if (decrypt && hash !== '') {
			const cryptr = new Cryptr(await guessAndCheckPassword(hash));
			for (let key of configKeys) {
				if (config[key] && config[key] !== '') {
					config[key] = cryptr.decrypt(config[key]);
				}
			}
		}

		return config;
	};

	// Initializes global config file
	const init = async () => {
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
		const prompts = configKeys.map(key => ({
			name: key,
			message: 'Enter your ' + chalk.yellow(unCamel(key)) + ' (leave blank if you wish):'
		}));

		// Collect user answers
		// TODO: this is really what it should be
		// const answers: VisibleSchema = await prompt(prompts);
		const answers: Schema = await prompt(prompts);

		// Save and give message
		await saveConfig(answers, password);
		console.log('Config initialized at ' + chalk.blue.underline(file));
	};

	// Loads the config, prompting the user to create one if it doesn't exist
	const ensureLoadConfig = async (decrypt: boolean = true) => {
		if (!fs.existsSync(file)){
			if (await confirm('No config file exists.  Would you like to create one?'))
				await init();
			else
				throw new Error(
					'Unable to continue without a config file.  Run `' +
					chalk.yellow('plopify config init') + '` to generate one.'
				);
		}

		return loadConfig(decrypt);
	};

	// Sets a specific key/value in the config
	const set = async (key?: ConfigKey, value?) => {
		let config = await ensureLoadConfig();

		// Determine which key to set
		if (!key) {
			key = (await prompt([{
				type: 'list',
				name: 'key',
				message: 'Which property do you want to set?',
				choices: configKeys
			}]) as any).key;
		} else if (configKeys.indexOf(key) === -1) {
			throw new Error('Invalid property: must be one of the following: ' + configKeys.join(','));
		}

		// Ask for a value if one was not provided
		if (!value) {
			value = (await prompt([{
				name: 'value',
				message: 'Enter a value for ' + chalk.yellow(unCamel(key)) + ':',
				default: config[key] === '' ? undefined : config[key]	// we don't want the default value to show if it's ''
			}]) as any).value;
		}

		// Patch the config
		config[key] = value;
		await saveConfig(config, await guessAndCheckPassword(config.password));

		console.log('Changes saved to', chalk.blue.underline(file));
	};

	// Reads the entire config file, or just one value if a key is passed
	const read = async (key?: ConfigKey) => {
		const data = await ensureLoadConfig();
		if (!key) {
			return data;
		} else {
			const value = data[key];
			if (value === '') {
				if (await confirm(`No value for ${key} has been set.  Would you like to set one?`)) {
					await set(key);
					return await read(key);
				} else {
					throw new Error('Unable to continue without a value for ' + key);
				}
			} else {
				return value;
			}
		}
	};

	// Ensures the specified keys have
	// const ensure = async (keys: ConfigKey[]) => {
	// 	const data = await loadAndDecrypt();
	// 	const emptyKeys = [];
	// 	for (let key in data) {
	//
	// 	}
	// };

	return {
		read,
		init,
		async view(key?: ConfigKey) {
			const config = visibleSchema(await ensureLoadConfig());

			if (!key) {
				console.log(JSON.stringify(config, null, 2));
			} else {
				console.log(config[key]);
			}
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
		set
	};
}
