<script>
	import { onMount } from 'svelte';
	import { db, boards } from '$lib/db';
	import { getBoards } from '$lib/ndk';
	import AddBoardModal from '$lib/components/AddBoardModal.svelte';
	import BoardCard from '$lib/components/BoardCard.svelte';

	let addBoardModal;

	function openModal() {
		addBoardModal.showModal();
	}

	onMount(async () => {
		await getBoards();
	});
</script>

<button onclick={openModal}>Add Board</button>
<AddBoardModal bind:modalRef={addBoardModal} />

<h1>Boards</h1>
{#if $boards.length > 0}
	<div class="flex flex-wrap gap-2">
		{#each $boards as board (board.id)}
			<BoardCard {board} />
		{/each}
	</div>
{/if}
