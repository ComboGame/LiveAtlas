export interface DebouncedFunction<T extends unknown[]> {
	(...args: T): void;
	cancel(): void;
}

/**
 * Creates a debounced version of the given function, which delays calls until wait ms have passed since the last call
 * Replaces lodash.debounce
 * @param {Function} fn The function to debounce
 * @param {number} wait The delay in ms
 */
export const debounce = <T extends unknown[]>(fn: (...args: T) => void, wait: number): DebouncedFunction<T> => {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	const debounced = (...args: T) => {
		if(timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			timeout = null;
			fn(...args);
		}, wait);
	};

	debounced.cancel = () => {
		if(timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	};

	return debounced;
};
