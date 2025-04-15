<script>
	import { setBoard } from '$lib/db';
	import { eventTitle } from '$lib/ndk';
	export let board;
</script>

<div class="card w-96 bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">{eventTitle(board)}</h2>
		<div class="card-actions justify-end">
			<a onclick={() => setBoard(board)} href={`/board/${board.dTag}`} class="btn btn-primary"
				>Open Board</a
			>
		</div>
	</div>
</div>
