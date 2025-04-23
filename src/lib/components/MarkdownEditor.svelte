<script>
	import { Carta, MarkdownEditor } from 'carta-md';
	import { emoji } from '@cartamd/plugin-emoji';
	// Component default theme
	import 'carta-md/default.css';

	const carta = new Carta({
		extensions: [emoji()]
	});

	export let value = '';
</script>

<MarkdownEditor bind:value {carta} />

<style>
	/* Or in global stylesheet */
	/* Set your monospace font */
	/* Required to have the editor working correctly! */
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
		line-height: 1.1rem;
		letter-spacing: normal;
	}
	/* Editor dark mode */
	/* Only if you are using the default theme */
	html.dark .carta-theme__default {
		--border-color: var(--border-color-dark);
		--selection-color: var(--selection-color-dark);
		--focus-outline: var(--focus-outline-dark);
		--hover-color: var(--hover-color-dark);
		--caret-color: var(--caret-color-dark);
		--text-color: var(--text-color-dark);
	}

	/* Code dark mode */
	/* Only if you didn't specify a custom code theme */
	html.dark .shiki,
	html.dark .shiki span {
		color: var(--shiki-dark) !important;
	}
</style>
