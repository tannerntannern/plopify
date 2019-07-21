import * as fs from 'fs';
import * as path from 'path';
import * as Cryptr from 'cryptr';
import * as bcrypt from 'bcrypt';
import { TypeOf } from 'io-ts';
import loader from 'rc.ts';
import * as confDir from 'home-or-tmp';

import { standardAdapter } from '../../util/standardAdapter';
import { guessAndCheckPassword, GuessAndCheckPasswordKeys } from '../../util/prompts';
import { UserConfigSchema, PlopifyConfigSchema, ConfigSchema } from '../../schema/config';

import { init, InitKeys } from '.';

export type Schema = TypeOf<typeof ConfigSchema>;
export type UserSchema = TypeOf<typeof UserConfigSchema>;
export type PlopifySchema = TypeOf<typeof PlopifyConfigSchema>;

export const userKeys = Object.keys(UserConfigSchema.props) as (keyof UserSchema)[];
export const plopifyKeys = Object.keys(PlopifyConfigSchema.props) as (keyof PlopifySchema)[];

export const configFilePath = path.resolve(confDir, '.plopifyrc.json');

/**
 * Returns whether or not ~/.plopifyrc.json already exists.
 */
export const configExists = () => fs.existsSync(configFilePath);

// TODO: how can input be disallowed?
export type SaveConfigKeys = never;

/**
 * Writes a fresh copy of the config data to ~/.plopifyrc.json, encrypting it if a password is given.
 */
export const saveConfig = (data: Schema, password?: string) => standardAdapter<SaveConfigKeys>(async (input, output) => {
	if (password && password !== '') {
		output({ type: 'info', message: 'Encrypting sensitive data' });

		const cryptr = new Cryptr(password);
		data.passwordHash = await bcrypt.hash(password, 10);
		for (let key in userKeys) {
			data[key] = cryptr.encrypt(data[key]);
		}
	} else {
		output({ type: 'info', message: 'Skipping encryption' });
		data.passwordHash = '';
	}

	output({ type: 'newTask', task: 'Saving config data' });

	try {
		fs.writeFileSync(configFilePath, JSON.stringify(ConfigSchema.encode(data), null, 2));
		output({ type: 'taskComplete', status: true });
		output({ type: 'info', message: `Saved to ${configFilePath}` });
	} catch (e) {
		output({ type: 'taskComplete', status: false });
		output({ type: 'warning', severe: true, message: `Failed to save config data: ${e.message}` });
	}
});

export type LoadConfigKeys = InitKeys & GuessAndCheckPasswordKeys;

/**
 * Loads ~/.plopifyrc.json and optionally decrypts it, prompting the user to create the file if it doesn't exist
 */
export const loadConfig = (decrypt: boolean = true) => standardAdapter<LoadConfigKeys>(async (input, output) => {
	if (!configExists()){
		if (await input('create-config', 'confirm', { message: 'No config file exists.  Would you like to create one?' }))
			await init().attach({ input, output }).exec();
		else {
			throw new Error(
				'Unable to continue without a config file.  Run `plopify config init` to generate one.'
			);
		}
	}

	let config = loader(ConfigSchema).loadConfigFile(configFilePath);
	const hash = config.passwordHash;

	if (decrypt && hash !== '') {
		const cryptr = new Cryptr(await guessAndCheckPassword(hash).attach({ input, output }).exec());
		for (let key of userKeys) {
			config[key] = cryptr.decrypt(config[key]);
		}
	}

	return config;
});

export type DeleteConfigKeys = { 'confirm-delete': 'confirm' };

/**
 * Deletes ~/.plopifyrc.json.
 */
export const deleteConfig = () => standardAdapter<DeleteConfigKeys>(async (input, output) => {
	if (configExists()) {
		if (await input('confirm-delete', 'confirm', { message: 'This will erase all plopify config data.  Are you sure you want to do this?' })) {
			fs.unlinkSync(configFilePath);
			output({ type: 'info', message: `${configFilePath} has been deleted.` });
		}
	}
});
