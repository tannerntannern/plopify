type Resolve<T> = (value?: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;

/**
 * The type of the "executor" argument passed to PromiseConstructor.
 */
type PromiseExecutor<T> = (resolve: Resolve<T>, reject?: Reject) => void;

/**
 * Identical to the executor that's passed to PromiseConstructor, with the addition of a status function
 */
type ProgressPromiseExecutor<T> = (resolve: Resolve<T>, reject?: Reject, status?: (data) => void) => void;

/**
 * Functionally similar to Promise<T>, but with the mandatory addition of `.status(...)` before `.then(...)`
 * @see progressPromise
 */
export type ProgressPromise<T> = {status: (onStatus: (data) => void) => Promise<T>};

/**
 * Accepts a ProgressPromiseExecutor and returns a Promise-like object that exposes a `status` function, similar to
 * `then` and `catch`.  The `status` function is used to handle status updates from a running Promise and will return
 * the actual Promise when called, which allows for an easy-to-understand chain:
 *
 * 	progressPromise((resolve, reject, status) => {
 * 	    // Do stuff in here, make calls to status to send updates, and resolve/reject as you would normally
 * 	})
 * 	.status((data) => {
 * 	    console.info('STATUS UPDATE:', data);
 * 	})
 * 	.then((result) => {
 *		console.log('COMPLETED:', result);
 * 	})
 * 	.catch((error) => {
 *		console.error('ERROR:', error);
 * 	}));
 */
export const progressPromise = <T = any>(executor: ProgressPromiseExecutor<T>): ProgressPromise<T> => ({
	status: (onStatus: (data) => void) => {
		// Converts our ProgressPromiseExecutor into a regular PromiseExecutor that can be fed to a Promise.  This is done
		// by fixing the `status` argument to a function that simply executes `onStatus` above.  By default, `onStatus` does
		// nothing, but it can be overridden with the `.status(...)` function.
		const regularPromiseExecutor: PromiseExecutor<T> =
			(resolve: Resolve<T>, reject: Reject) => executor(resolve, reject, (data) => onStatus(data));

		// Constructs a Promise with the modified executor and attaches the described `.status(...)` functionality
		return new Promise<T>(regularPromiseExecutor);
	}
});
