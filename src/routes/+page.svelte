<script>
	import { onMount } from 'svelte';
	import { db, boards, user, userBoards } from '$lib/db';
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

<div class="flex w-full">
	<button class="btn ml-auto mr-2" disabled={!$user} onclick={openModal}>Add Board</button>
</div>
<AddBoardModal bind:modalRef={addBoardModal} />

<div class="flex w-full flex-col gap-2">
	{#if $user}
		<h1 class="mx-auto text-lg">Your Boards</h1>
		<div class="grid grid-flow-col grid-rows-2 gap-2 overflow-x-auto">
			{#key $userBoards}
				{#each $userBoards as board (board.id)}
					<BoardCard {board} />
				{/each}
			{/key}
		</div>
	{/if}

	{#if $boards.length > 0}
		<h1 class="mx-auto text-lg">Alle Boards</h1>
		<div class="grid grid-flow-col grid-rows-2 overflow-y-auto">
			{#if $user}
				{#each $boards.filter((e) => e.pubkey !== $user.pubkey) as board (board.id)}
					<BoardCard {board} />
				{/each}
			{:else}
				{#each $boards as board (board.id)}
					<BoardCard {board} />
				{/each}
			{/if}
		</div>
	{/if}
</div>
