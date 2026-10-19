/**
 * Copies the given text to the clipboard
 * Uses the async clipboard API where available, with a fallback for insecure contexts (http) where it is not
 * Replaces @soerenmartius/vue3-clipboard
 * @param {string} text The text to copy
 */
export const copyToClipboard = async (text: string): Promise<void> => {
	if(navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(text);
	}

	const textarea = document.createElement('textarea'),
		activeElement = document.activeElement as HTMLElement | null;

	textarea.value = text;
	textarea.setAttribute('readonly', '');
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	textarea.style.pointerEvents = 'none';
	document.body.appendChild(textarea);
	textarea.select();

	try {
		if(!document.execCommand('copy')) {
			throw new Error('execCommand copy failed');
		}
	} finally {
		textarea.remove();
		activeElement?.focus();
	}
};
