<script>
	import { eventTitle } from '$lib/ndk';
	import { user, selectedColumn } from '$lib/db';
	import { marked } from 'marked';
	import AddCardModal from './AddCardModal.svelte';

	export let card;
	export let column;

	let addCardModal;

	function handleClick(e) {
		$selectedColumn = column.dTag;
		$user?.pubkey && addCardModal.showModal();
	}
</script>

<div on:click={handleClick} class="flex flex-col gap-1 rounded-xl border border-none bg-orange-300">
	<h1 class="p-1 text-xl font-bold">{eventTitle(card)}</h1>
	<p class="p-1">{@html marked.parse(card.content)}</p>
</div>

<AddCardModal bind:modalRef={addCardModal} {card} {column} />
