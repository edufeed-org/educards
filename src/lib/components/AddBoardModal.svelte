<script>
	import { addBoard } from '$lib/ndk';
	export let modalRef;

	function createBoard() {
		const board = {
			title
		};
		addBoard(board);
	}
	let title;
</script>

<!-- Open the modal using ID.showModal() method -->
<dialog id="add-board" class="modal" bind:this={modalRef}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Gib deinem Board einen Titel</h3>
		<label class="input input-bordered">
			<input type="text" bind:value={title} />
		</label>
		<div class="modal-action">
			<form method="dialog">
				<button class="btn btn-warning">Close</button>
				<button class="btn btn-success" onclick={() => createBoard()}>Create Board!</button>
			</form>
		</div>
	</div>
</dialog>
