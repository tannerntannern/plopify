import { standardAdapter } from '../../util/standardAdapter';

import { loadConfig, UserSchema } from './_common';
import { set } from './set';

/**
 * Reads the entire config file, or just one value if a key is passed
 */
export const read = <K extends keyof UserSchema>(key?: K) => standardAdapter(async (input, output) => {
	const data = await loadConfig().attach({ input, output }).exec();
	
	if (!key) {
		return data;
	} else {
		const value = data[key];
		if (value === '') {
			if (await input('set-missing-value', 'confirm', { message: `No value for ${key} has been set.  Would you like to set one?` })) {
				// FIXME
				// @ts-ignore
				await set(key).attach({ input, output }).exec();
				return await read(key).attach({ input, output }).exec();
			} else {
				throw new Error('Unable to continue without a value for ' + key);
			}
		} else {
			return value;
		}
	}
});
