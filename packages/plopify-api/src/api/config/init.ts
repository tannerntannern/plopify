import { unCamel } from '../../util/case';
import { standardAdapter } from '../../util/standardAdapter';
import { collectPassword } from '../../util/prompts';

import { configFilePath, configExists, saveConfig, userKeys, UserSchema, PlopifySchema } from './_common';

// TODO: may want to investigate whether 'input's are good enough for all the keys of UserSchema
export type InitKeys = { 'use-password': 'confirm' } & { [key in keyof UserSchema]: 'input' };

/**
 * Initializes global config file
 */
export const init = () => standardAdapter<InitKeys>(async (input, output) => {
	if (configExists())
		throw new Error('Config file already exists.');

	// Ask if the user wants password protection
	const usePassword = await input('use-password', 'confirm', { message: 'Do you want to password-protect your data?' });

	// Collect as password if the user wants one
	let password = '';
	if (usePassword) password = await collectPassword().attach({ input, output }).exec();

	// Collect values from user
	const userProps = {} as UserSchema;
	for (const key of userKeys) {
		userProps[key] = await input(key, 'input', { message: `Enter your "${unCamel(key)} (leave blank if you wish):"` });
	}

	// Fill in system properties
	const systemProps: PlopifySchema = {
		lastUpdateCheck: 0,
		passwordHash: '',	// TODO: semantically this is a little weird but functionally it's fine
	};

	// Save and give message
	await saveConfig({ ...userProps, ...systemProps }, password);
	output({ type: 'info', message: `Config initialized at ${configFilePath}` });
});
