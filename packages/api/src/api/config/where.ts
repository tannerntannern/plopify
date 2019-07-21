import { standardAdapter } from '../../util/standardAdapter';
import { configFilePath, configExists } from './_common';

/**
 * Reveals the location of the plopify config
 */
export const where = () => standardAdapter(async (input, output) => {
	if (configExists()){
		return configFilePath;
	} else {
		// TODO: this is not I/O agnostic
		throw new Error('No config file exists.  Run `plopify config init` to generate one.');
	}
});
