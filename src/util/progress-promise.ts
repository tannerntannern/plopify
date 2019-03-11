type Resolve<R> = (value?: R | PromiseLike<R>) => void;
type Reject = (reason?: any) => void;
type Status<S> = (data: S) => void;

/**
 * The type of the "executor" argument passed to PromiseConstructor.
 */
type PromiseExecutor<T> = (resolve: Resolve<T>, reject?: Reject) => void;

/**
 * Identical to the executor that's passed to PromiseConstructor, with the addition of a status function
 */
type ProgressPromiseExecutor<R, S> = (resolve: Resolve<R>, reject?: Reject, status?: Status<S>) => void;

/**
 * Functionally similar to Promise<T>, but with the mandatory addition of `.status(...)` before `.then(...)`
 * @see progressPromise
 */
export type ProgressPromise<R, S> = {status: (onStatus?: Status<S>) => Promise<R>};

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
export const progressPromise = <R = any, S = any>(executor: ProgressPromiseExecutor<R, S>): ProgressPromise<R, S> => ({
	status: (onStatus) => {
		if (!onStatus) onStatus = () => {};

		const regularPromiseExecutor: PromiseExecutor<R> =
			(resolve: Resolve<R>, reject: Reject) => executor(resolve, reject, onStatus);

		return new Promise<R>(regularPromiseExecutor);
	}
});
