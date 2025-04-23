<script>
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import AddColumnModal from './AddColumnModal.svelte';
	import { cardsForColumn, columnsForBoard, currentBoard, user, userAndBoardMatch } from '$lib/db';
	import { eventTitle, publishBoard } from '$lib/ndk';
	import Column from './Column.svelte';

	export let boardAddress;

	let addColumnModal;

	function openColumnModal() {
		addColumnModal.showModal();
	}

	$: items = $columnsForBoard.map((col) => {
		col.items = cardsForColumn(col.id);
		return col;
	});

	const flipDurationMs = 200;

	function handleDndConsiderColumns(e) {
		items = e.detail.items;
	}
	function handleDndFinalizeColumns(e) {
		items = e.detail.items;

		// store current state
		publishBoard({ ...$currentBoard, items });
	}
	function handleClick(e) {
		alert('dragabble elements are still clickable :)');
	}
</script>

<div class="flex flex-row items-center justify-between">
	<h1 class="ml-5 text-lg font-bold">{eventTitle($currentBoard)}</h1>
	{#if $user && userAndBoardMatch($user, $currentBoard)}
		<button class="btn mr-5" on:click={openColumnModal}>Add column</button>
	{/if}
</div>
<section
	class="board flex flex-nowrap gap-2"
	use:dndzone={{ items, flipDurationMs, type: 'columns' }}
	on:consider={handleDndConsiderColumns}
	on:finalize={handleDndFinalizeColumns}
>
	{#each items as column (column.id)}
		<div class="w-96" animate:flip={{ duration: flipDurationMs }}>
			<Column {column} {flipDurationMs} bind:items />
		</div>
	{/each}
</section>
<AddColumnModal bind:modalRef={addColumnModal} />

<style>
	.board {
		height: 90vh;
		width: 100%;
		padding: 0.5em;
		margin-bottom: 40px;
	}
</style>
