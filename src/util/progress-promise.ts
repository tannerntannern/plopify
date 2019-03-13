// TODO: this should become its own npm package once it has solidified and plopify is ready to back it

type Resolve<R> = (value?: R | PromiseLike<R>) => void;
type Reject = (reason?: any) => void;
type Status<S> = (data: S) => void;
type Input<I> = <K extends keyof I>(key: K) => Promise<I[K]>;

/**
 * The type of the "executor" argument passed to PromiseConstructor.
 */
type PromiseExecutor<T> = (resolve: Resolve<T>, reject?: Reject) => void;

/**
 * Identical to the executor that's passed to PromiseConstructor, with the addition of status and input functions.
 */
type ProgressPromiseExecutor<R, S, I> = (resolve: Resolve<R>, reject?: Reject, status?: Status<S>, input?: Input<I>) => void;

/**
 * Functionally similar to Promise<T>.
 * @see progressPromise()
 */
export type ProgressPromise<R, S, I> = {
	promise: () => Promise<R>,
	status: (onStatus?: Status<S>) => ProgressPromise<R, S, I>,
	input: (onInput?: Input<I>) => ProgressPromise<R, S, I>
};

/**
 * Accepts a ProgressPromiseExecutor and returns a Promise-like object that exposes `status` and `input` functions,
 * similar to `then` and `catch`.  The `status` function is used to handle status updates from a running Promise, while
 * the `input` function is used to ask for user input while the promise is running.
 *
 * You can use progressPromise() in place of a regular Promise like so:
 *
 * 	progressPromise((resolve, reject) => { ... })   // create the ProgressPromise
 * 	.promise()                                      // retrieve the actual Promise
 * 	.then(result => { ... });                       // handle the result
 *
 * You can also hook into status updates before creating the Promise, like so:
 *
 * 	progressPromise((resolve, reject, status) => {
 *		// ...
 *		status({msg: 'Status update'});
 *		// ...
 *		status({msg: 'Another update'});
 *		// ...
 *		resolve();
 * 	})
 * 	.status(data => console.log(data.msg))   // register a status handler
 * 	.promise()                               // retrieve the actual Promise
 * 	.then(result => { ... });                // handle the result
 *
 * You can additionally request input while the promise is running, like so:
 *
 * 	progressPromise(async (resolve, reject, status, input) => {
 *		// ...
 *		const password = await input('password');
 *		// ...
 *		resolve();
 * 	})
 * 	.input(async (key) => await promptUserFor(key))   // register a function that will retrieve the named value
 * 	.promise()                                        // retrieve the actual Promise
 * 	.then(result => { ... });                         // handle the result
 *
 * This may seem a little odd, but this allows for great flexibility in HOW input is collected.  The above example
 * demonstrates how you might get input from the user via CLI input, but you could also get the information from a REST
 * API, or a plain object lookup.  Either way, all options are possibilities without the progressPromise needing to be
 * rewritten.
 *
 * Finally, you can also use .status() in addition to .input(), using similar techniques as described above.
 */
export const progressPromise = <R = any, S = any, I = {[key: string]: any}>(executor: ProgressPromiseExecutor<R, S, I>): ProgressPromise<R, S, I> => {
	let status: Status<S> = () => {};
	let input: Input<I> = async (key) => {
		throw new Error(`Input "${key}" must be supplied`);
	};

	const promiseExecutor = (): PromiseExecutor<R> =>
		(resolve: Resolve<R>, reject: Reject) => executor(resolve, reject, status, input);

	return {
		promise: () => new Promise<R>(promiseExecutor()),
		status: function (onStatus) {
			status = onStatus;
			return this;
		},
		input: function (onInput) {
			input = onInput;
			return this;
		}
	};
};
