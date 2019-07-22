/**
 * fast-glob uses something called "modern mode" (see https://github.com/mrmlnc/fast-glob#old-and-modern-mode) in node
 * v10.10 and up.  This mode is faster, but it causes `fs.readdir` to be used with the `withFileTypes` option, which is
 * not supported in mock-fs and causes tests to fail.  At the time of writing, it's good enough to just disable modern
 * mode by passing `stats: true` for all fast-glob calls.
 */
export const fgBaseConfig = {
	stats: true as true,
};
