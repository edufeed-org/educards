<script>
	import Board from '$lib/components/Board.svelte';
	import { currentBoardAddress } from '$lib/db.js';
	export let data;

	console.log(data.id);
	$currentBoardAddress = data.id;
</script>

<Board boardAddress={data.id} />
