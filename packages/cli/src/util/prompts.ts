import { prompt } from 'inquirer';

/**
 * A stripped down inquirer-prompt based function that gets a single value from the user.
 */
export const simplePrompt = async (options) => (await prompt([{
	name: 'value', type: options.type, message: options.message
}]) as any).value;
