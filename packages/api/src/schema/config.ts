import * as t from 'io-ts';
import { withDefault } from 'rc.ts';

/**
 * Fields in ~/.plopifyrc.json that are set by the user and (optionally) password protected.
 */
export let UserConfigSchema = t.type({
	coverallsPersonalApiToken: withDefault(t.string, ''),
	githubUsername: withDefault(t.string, ''),
	githubPersonalAccessToken: withDefault(t.string, ''),
	travisCiApiToken: withDefault(t.string, ''),
});

/**
 * Fields in ~/.plopifyrc.json that are only to be used by plopify, so the user doesn't need to see them.
 */
export let PlopifyConfigSchema = t.type({
	lastUpdateCheck: withDefault(t.number, 0),
	passwordHash: withDefault(t.string, ''),
});

/**
 * The full schema of ~/.plopifyrc.json.
 */
export let ConfigSchema = t.intersection([UserConfigSchema, PlopifyConfigSchema]);
