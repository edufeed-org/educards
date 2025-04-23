<script>
	// This is done in a single file for clarity. A more factored version here: https://svelte.dev/repl/288f827275db4054b23c437a572234f6?version=3.38.2
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import AddColumnModal from './AddColumnModal.svelte';
	import AddCardModal from './AddCardModal.svelte';
	import { cardsForColumn, columnsForBoard, selectedColumn, currentBoard, user } from '$lib/db';
	import { eventTitle, publishBoard, publishCards } from '$lib/ndk';

	export let boardAddress;

	let addColumnModal;
	let addCardModal;

	function openColumnModal() {
		addColumnModal.showModal();
	}
	function openCardModal() {
		addCardModal.showModal();
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
	function handleDndConsiderCards(cid, e) {
		const colIdx = items.findIndex((c) => c.id === cid);
		items[colIdx].items = e.detail.items;
		items = [...items];
	}
	function handleDndFinalizeCards(cid, e) {
		const colIdx = items.findIndex((c) => c.id === cid);
		items[colIdx].items = e.detail.items;
		items = [...items];
		publishCards(items[colIdx]);
	}
	function handleClick(e) {
		alert('dragabble elements are still clickable :)');
	}

	function deleteColumn(columnId) {
		const updatedBoardItems = items.filter((e) => e.id !== columnId);
		publishBoard({ ...$currentBoard, items: updatedBoardItems });
	}

	function deleteCard(column, itemId) {
		const updatedColumnItems = column.items.filter((e) => e.id !== itemId);
		publishCards({ ...column, items: updatedColumnItems });
	}

	function userAndBoardMatch(user, board) {
		return user !== undefined && board && user?.pubkey === board?.pubkey;
	}
</script>

<div class="flex flex-row items-center justify-between">
	<h1 class="ml-5 text-lg">{eventTitle($currentBoard)}</h1>
	{#if userAndBoardMatch($user, $currentBoard)}
		<button class="btn mr-5" on:click={openColumnModal}>Add column</button>
	{/if}
</div>
<section
	class="board flex flex-nowrap"
	use:dndzone={{ items, flipDurationMs, type: 'columns' }}
	on:consider={handleDndConsiderColumns}
	on:finalize={handleDndFinalizeColumns}
>
	{#each items as column (column.id)}
		<div class="column" animate:flip={{ duration: flipDurationMs }}>
			{#if column !== undefined}
				<div class="flex">
					<div class="column-title">{column.dTag}</div>
					{#if userAndBoardMatch($user, $currentBoard)}
						<button class="btn btn-error ml-auto mr-0" on:click={() => deleteColumn(column.id)}
							>🗑️</button
						>
					{/if}
				</div>
				<div class="flex">
					{#if userAndBoardMatch($user, $currentBoard)}
						<button
							class="btn mx-auto"
							on:click={() => {
								// set selected columns
								$selectedColumn = column.dTag;
								openCardModal();
							}}>Add Card</button
						>
					{/if}
				</div>

				{#if column.items.every((e) => e !== undefined)}
					<div
						class="column-content"
						use:dndzone={{ items: column.items, flipDurationMs }}
						on:consider={(e) => handleDndConsiderCards(column.id, e)}
						on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
					>
						<!-- {@debug column} -->
						{#each column.items as item (item?.id ?? item)}
							<div class="card" animate:flip={{ duration: flipDurationMs }}>
								{eventTitle(item)}
								{item.content}
								<button on:click={() => deleteCard(column, item.id)}>Delete</button>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/each}
</section>
<AddColumnModal bind:modalRef={addColumnModal} />
<AddCardModal bind:modalRef={addCardModal} />

<style>
	.board {
		height: 90vh;
		width: 100%;
		padding: 0.5em;
		margin-bottom: 40px;
	}
	.column {
		height: 100%;
		width: 250px;
		padding: 0.5em;
		margin: 1em;
		float: left;
		border: 1px solid #333333;
		/*Notice we make sure this container doesn't scroll so that the title stays on top and the dndzone inside is scrollable*/
		overflow-y: hidden;
	}
	.column-content {
		height: 100%;
		/* Notice that the scroll container needs to be the dndzone if you want dragging near the edge to trigger scrolling */
		overflow-y: scroll;
	}
	.column-title {
		margin-bottom: 1em;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.card {
		height: 15%;
		width: 100%;
		margin: 0.4em 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #dddddd;
		border: 1px solid #333333;
	}
</style>
