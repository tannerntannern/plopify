import { makeAdapter, Adapter, AdapterExecutor, AdapterMeta } from 'adapter';

type Output =
	{ type: 'newTask', task: string } |
	{ type: 'taskComplete', status: boolean } |
	{ type: 'info', message: string } |
	{ type: 'warning', message: string, severe?: boolean };

type InputTypes = {
	confirm: boolean,
	input: string,
	password: string,
	list: string,
};

type OptionsBase = { message: string, default?: string };
type InputOptions = {
	confirm: Omit<OptionsBase, 'default'>,
	input: OptionsBase,
	password: OptionsBase,
	list: OptionsBase & { choices: string[] }
};

type Keys = { [key: string]: keyof InputTypes };

type Input<K extends Keys> = {
	types: InputTypes,
	options: InputOptions,
	keys: K & { [other: string]: keyof InputTypes }
};

type StandardAdapter<I extends Keys, R> = Adapter<R, Input<I>, Output>;

/**
 * Shortcut for `makeAdapter<...>(...)` that has all the standard typing setup for you.
 */
export const standardAdapter = <I extends Keys = Keys, R = any>(
	executor: AdapterExecutor<R, Input<I>, Output>,
	meta?: AdapterMeta<R, Input<I>, Output>,
): StandardAdapter<I, R> =>
		makeAdapter<R, Input<I>, Output>(executor, meta);
