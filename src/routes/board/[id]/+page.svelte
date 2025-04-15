<script>
	import Board from '$lib/components/Board.svelte';
	import { currentBoardId } from '$lib/db.js';
	export let data;

	console.log('data.id', data.id);
	$currentBoardId = data.id;
</script>

<Board boardId={data.id} />
