<script>
	import { eventTitle } from '$lib/ndk';
	import { marked } from 'marked';

	export let card;

	function deleteCard(column, itemId) {
		const updatedColumnItems = column.items.filter((e) => e.id !== itemId);
		publishCards({ ...column, items: updatedColumnItems });
	}
</script>

<div class="flex flex-col gap-1 rounded-xl border border-none bg-orange-300">
	<h1 class="p-1 text-xl font-bold">{eventTitle(card)}</h1>
	<p class="p-1">{@html marked.parse(card.content)}</p>
	<button class="btn btn-warning m-1" on:click={() => deleteCard(column, item.id)}>Delete</button>
</div>
