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
 * Identical to Promise<T>, but with the addition of a status function.
 * @see progressPromise
 */
type ProgressPromise<T> = Promise<T> & {status: (onStatus: (data) => void) => ProgressPromise<T>};

/**
 * Returns a slightly modified Promise that includes the option to use `.status(...)` for progress updates.  The
 * standard `.then(...)` and `.catch(...)` will work as expected.
 */
export function progressPromise<T>(executor: ProgressPromiseExecutor<T>): ProgressPromise<T> {
	// Placeholder callback for `.status(...)`
	let onStatus = (data) => {};

	// Converts our ProgressPromiseExecutor into a regular PromiseExecutor that can be fed to a Promise.  This is done
	// by fixing the `status` argument to a function that simply executes `onStatus` above.  By default, `onStatus` does
	// nothing, but it can be overridden with the `.status(...)` function.
	const regularPromiseExecutor: PromiseExecutor<T> =
		(resolve: Resolve<T>, reject: Reject) => executor(resolve, reject, (data) => onStatus(data));

	// Constructs a Promise with the modified executor and attaches the described `.status(...)` functionality
	let promise: any = new Promise<T>(regularPromiseExecutor);
	promise.status = (callback: (data) => void) => {
		onStatus = callback;
		return promise;
	};

	return promise;
}
