<script>
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	import Card from './Card.svelte';
	import PlusCircleFill from '$lib/icons/PlusCircleFill.svelte';
	import AddCardModal from './AddCardModal.svelte';
	import {
		selectedColumn,
		currentBoard,
		user,
		userAndBoardMatch,
		deleteColumn,
		ndkStore
	} from '$lib/db';
	import { eventTitle, publishCards } from '$lib/ndk';
	import { NDKEvent } from '@nostr-dev-kit/ndk';

	export let column;
	export let flipDurationMs;
	export let items;

	let addCardModal;

	function openCardModal() {
		addCardModal.showModal();
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

		const newColumn = new NDKEvent(ndkStore, items[colIdx]);
		newColumn.tags = newColumn.tags.filter((e) => e[0] !== 'a');
		e.detail.items.forEach((card) => {
			newColumn.tags.push(['a', card.tagAddress()]);
		});
		publishCards(newColumn);
	}
</script>

{#if column !== undefined}
	<div class="flex">
		<div
			class="flex w-full justify-center rounded-xl border border-none bg-orange-300 p-1 text-lg font-bold"
		>
			<p>{eventTitle(column)}</p>
		</div>
		{#if userAndBoardMatch($user, $currentBoard)}
			<button class="btn btn-error mr-0 ml-auto" on:click={() => deleteColumn(column.id)}>🗑️</button
			>
		{/if}
	</div>
	<div class="flex">
		{#if userAndBoardMatch($user, $currentBoard)}
			<button
				class="btn bg-base-300 my-1 w-full border-none"
				on:click={() => {
					// set selected columns
					$selectedColumn = column.dTag;
					openCardModal();
				}}
			>
				<PlusCircleFill />
			</button>
		{/if}
	</div>

	{#if column.items.every((e) => e !== undefined)}
		<div
			class="h-full"
			use:dndzone={{ items: column.items, flipDurationMs }}
			on:consider={(e) => handleDndConsiderCards(column.id, e)}
			on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
		>
			{#each column.items as item (item?.id ?? item)}
				<div class="my-1 p-1" animate:flip={{ duration: flipDurationMs }}>
					<Card card={item} {column} />
				</div>
			{/each}
		</div>
	{/if}
{/if}

<AddCardModal bind:modalRef={addCardModal} {column} />
