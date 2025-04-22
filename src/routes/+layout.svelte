<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	let { children } = $props();

	import { onMount } from 'svelte';
	import { ndkStore, initNDK } from '$lib/db';

	onMount(async () => {
		try {
			await ndkStore.init();
			// You could auto-sign in here if you have stored credentials
			// or let the user explicitly sign in from a component
			initNDK();
		} catch (error) {
			console.error('Failed to initialize NDK:', error);
		}
	});
</script>

<Navbar />
{@render children()}
