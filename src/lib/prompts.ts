import {prompt} from 'inquirer';

/**
 * Quick, dirty utility to get confirmation from the user.
 */
export const confirm = async (message: string): Promise<boolean> => (await prompt([{
	type: 'confirm',
	name: 'confirmation',
	message: message
}]) as any).confirmation;

/**
 * Collects a confirmed password from the user, recursively restarting until they don't fuck it up.
 */
export const collectPassword = async (): Promise<string> => {
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
export const getPassword = async (message: string = 'Please enter your password:'): Promise<string> => {
	return (await prompt([{
		type: 'password',
		name: 'password',
		mask: '*',
		message: message
	}]) as any).password;
};
