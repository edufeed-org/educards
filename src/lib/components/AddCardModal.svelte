<script>
	import { addCard, eventTitle } from '$lib/ndk';
	import { ndkStore, replaceTagArray, deleteCard } from '$lib/db';
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';

	export let modalRef;
	export let card = new NDKEvent($ndkStore, {
		kind: 30045,
		content: 'Write something awesome here 🌱',
		tags: [['title', 'Titel']]
	});

	/** @type {NDKEvent} */
	export let column;

	let title = eventTitle(card);

	function handleAddCard() {
		console.log('adding card', card, column);
		const newTags = replaceTagArray(card.tags, 'title', ['title', title]);
		card.tags = newTags;
		addCard(card, column);
	}
</script>

<dialog id="add-card" class="modal" bind:this={modalRef}>
	<div class="modal-box flex w-3/4 max-w-5xl flex-col gap-1">
		<h3 class="flex justify-center text-lg font-bold">Add Card</h3>
		<label class="input input-bordered w-full"
			>Titel
			<input type="text" bind:value={title} />
		</label>
		<MarkdownEditor bind:value={card.content} />
		<div class="modal-action">
			<form method="dialog">
				{#if card?.id !== ''}
					<button class="btn btn-warning m-1" on:click={() => deleteCard(card, column)}
						>Delete</button
					>
				{/if}
				<button class="btn btn-warning">Close</button>
				<button class="btn btn-success" on:click={handleAddCard}>
					{#if card?.id !== ''}
						Update Card
					{:else}
						Add card
					{/if}
				</button>
			</form>
		</div>
	</div>
</dialog>
