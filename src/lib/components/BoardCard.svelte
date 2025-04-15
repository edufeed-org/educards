<script>
	import { setBoard, user, userBoards } from '$lib/db';
	import { eventTitle, forkBoard, deleteBoard } from '$lib/ndk';
	export let board;
</script>

<div class="card w-96 flex-none bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">{eventTitle(board)}</h2>
		<div class="card-actions justify-end">
			{#if $user && board.pubkey !== $user?.pubkey}
				{#if $userBoards.map((e) => e.dTag).includes(board.dTag)}
					<p class="text-info">Already forked</p>
				{:else}
					<button onclick={() => forkBoard(board)} class="btn btn-success">Fork</button>
				{/if}
			{/if}
			<a
				onclick={() => setBoard(board)}
				href={`/board/${board.tagAddress()}`}
				class="btn btn-primary">Open Board</a
			>
			{#if $user && $userBoards.map((e) => e.dTag).includes(board.dTag)}
				<button onclick={() => deleteBoard(board)} class="btn btn-error">🗑️</button>
			{/if}
		</div>
	</div>
</div>
