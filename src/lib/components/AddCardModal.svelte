<script>
	import { addCard } from '$lib/ndk';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';

	export let modalRef;

	let title = '';
	let content = 'Write something awesome here 🌱';
	function handleAddCard() {
		const card = {
			title,
			content
		};
		addCard(card);
	}
</script>

<dialog id="add-card" class="modal" bind:this={modalRef}>
	<div class="modal-box flex w-3/4 max-w-5xl flex-col gap-1">
		<h3 class="flex justify-center text-lg font-bold">Add Card</h3>
		<label class="input input-bordered w-full"
			>Titel
			<input type="text" bind:value={title} />
		</label>
		<MarkdownEditor bind:value={content} />
		<div class="modal-action">
			<form method="dialog">
				<button class="btn btn-warning">Close</button>
				<button class="btn btn-success" on:click={handleAddCard}>Add card</button>
			</form>
		</div>
	</div>
</dialog>
