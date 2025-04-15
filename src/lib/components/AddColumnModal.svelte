<script>
	import { addColumn } from '$lib/ndk';

	export let modalRef;

	let title;
	function handleAddColumn() {
		const column = {
			title
		};
		addColumn(column);
	}
</script>

<dialog id="add-column" class="modal" bind:this={modalRef}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Add Column</h3>
		<label class="input input-bordered"
			>Titel
			<input type="text" bind:value={title} />
		</label>
		<p class="py-4">Press ESC key or click the button below to close</p>
		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Close</button>
				<button on:click={handleAddColumn}>Add column</button>
			</form>
		</div>
	</div>
</dialog>
