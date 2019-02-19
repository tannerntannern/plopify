import {prompt} from 'inquirer';
import * as bcrypt from 'bcrypt';

/**
 * Quick, dirty utility to get confirmation from the user.
 */
export const confirm = async (message: string): Promise<boolean> => (await prompt([{
	type: 'confirm',
	name: 'confirmation',
	message: message
}]) as any).confirmation;

/**
 * Gets a password from the user without confirmation using a custom message.
 *
 * @internal
 * @see guessAndCheckPassword
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
 * A cache available by closure to collectPassword() and guessAndCheckPassword().  This prevents the user from ever
 * being asked for their password more than once per session.
 */
let passwordCache = null;

/**
 * Collects a confirmed password from the user, recursively restarting until they don't fuck it up.  If another function
 * subsequently needs the password, the password will be available in the passwordCache.
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
		passwordCache = passwordData.password;
		return passwordData.password;
	}
};

/**
 * Allows the user to check their password against the given hash and keep retrying until they get it right.  Returns
 * the correct password once it has been found.  The function also caches a copy of the correct password in memory, so
 * that the user need not be asked for it multiple times per session.
 */
export const guessAndCheckPassword = async (passwordHash: string): Promise<string> => {
	if (passwordCache !== null) return passwordCache;

	passwordCache = await getPassword();
	while (!await bcrypt.compare(passwordCache, passwordHash)) {
		passwordCache = await getPassword('Incorrect password. Try again:');
	}

	return passwordCache;
};
