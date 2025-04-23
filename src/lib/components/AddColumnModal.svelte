<script>
	import { addColumn } from '$lib/ndk';

	export let modalRef;

	let title = 'Titel';
	function handleAddColumn() {
		const column = {
			title
		};
		addColumn(column);
	}
</script>

<dialog id="add-column" class="modal" bind:this={modalRef}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Wie soll die Spalte heissen?</h3>
		<label class="input input-bordered"
			>Titel
			<input type="text" bind:value={title} />
		</label>
		<div class="modal-action">
			<form method="dialog">
				<button class="btn btn-warning">Close</button>
				<button class="btn btn-success" on:click={handleAddColumn}>Add column</button>
			</form>
		</div>
	</div>
</dialog>
