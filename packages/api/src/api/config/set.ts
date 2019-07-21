import { unCamel } from '../../util/case';
import { standardAdapter } from '../../util/standardAdapter';
import { guessAndCheckPassword } from '../../util/prompts';

import { loadConfig, LoadConfigKeys, saveConfig, userKeys, UserSchema } from './_common';

export type SetKeys = LoadConfigKeys & {key: 'list', value: 'input'};

/**
 * Sets a specific key/value in the config
 */
export const set = (key?: keyof UserSchema, value?) => standardAdapter<SetKeys>(async (input, output) => {
	let config = await loadConfig().attach({ input, output }).exec();

	// Determine which key to set
	if (!key) {
		// eslint-disable-next-line require-atomic-updates
		key = await input('key', 'list', { choices: userKeys, message: 'Which property do you want to set?' }) as keyof UserSchema;
	} else if (userKeys.indexOf(key) === -1) {
		throw new Error(`Invalid property: must be one of the following: ${userKeys.join(',')}`);
	}

	// Ask for a value if one was not provided
	if (!value) {
		// eslint-disable-next-line require-atomic-updates
		value = await input('value', 'input', { message: `Enter a value for "${unCamel(key)}":`, default: config[key] });
	}

	// Patch the config
	config[key] = value;
	await saveConfig(config, await guessAndCheckPassword(config.passwordHash).attach({ input, output }).exec());
});
