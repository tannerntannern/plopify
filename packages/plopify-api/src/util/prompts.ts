import * as bcrypt from 'bcrypt';
import { standardAdapter } from './standardAdapter';

/**
 * A cache available by closure to collectPassword() and guessAndCheckPassword().  This prevents the user from ever
 * being asked for their password more than once per session.
 */
let passwordCache = null;

export type CollectPasswordKeys = {'password': 'password', 'password-confirm': 'password'};

/**
 * Collects a confirmed password from the user, recursively restarting until they don't fuck it up.  If another function
 * subsequently needs the password, the password will be available in the passwordCache.
 */
export const collectPassword = () => standardAdapter<CollectPasswordKeys, string>(async (input, output) => {
	const password = await input('password', 'password', { message: 'Enter a password:' });
	const passwordConfirm = await input('password-confirm', 'password', { message: 'Confirm password:' });

	if (password !== passwordConfirm) {
		output({ type: 'warning', message: 'The password confirmation does not match.  Please try again.' });
		return await collectPassword().attach({ output, input }).exec();
	} else {
		passwordCache = password;
		return password;
	}
});

export type GuessAndCheckPasswordKeys = {'password': 'password'};

/**
 * Allows the user to check their password against the given hash and keep retrying until they get it right.  Returns
 * the correct password once it has been found.  The function also caches a copy of the correct password in memory, so
 * that the user need not be asked for it multiple times per session.
 */
export const guessAndCheckPassword = (passwordHash: string) => standardAdapter<GuessAndCheckPasswordKeys, string>(async (input, output) => {
	if (passwordCache !== null) return passwordCache;

	passwordCache = await input('password', 'password', { message: 'Enter your password:' });
	while (!await bcrypt.compare(passwordCache, passwordHash)) {
		passwordCache = await input('password', 'password', { message: 'Incorrect password. Try again:' });
	}

	return passwordCache;
});
