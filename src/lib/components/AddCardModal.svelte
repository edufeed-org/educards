<script>
	import { addCard } from '$lib/ndk';

	export let modalRef;

	let title;
	function handleAddCard() {
		const card = {
			title
		};
		addCard(card);
	}
</script>

<dialog id="add-card" class="modal" bind:this={modalRef}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Add Card</h3>
		<label class="input input-bordered"
			>Titel
			<input type="text" bind:value={title} />
		</label>
		<p class="py-4">Press ESC key or click the button below to close</p>
		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Close</button>
				<button on:click={handleAddCard}>Add card</button>
			</form>
		</div>
	</div>
</dialog>
