import { writable, derived, get } from 'svelte/store';
import NDK from '@nostr-dev-kit/ndk';
import { columnsDsFromBoard } from './ndk';

export const events = writable([]);
export const boards = derived(events, ($events) => {
	const allBoards = $events.filter((e) => e.kind === 30043);
	const deduped = deduplicateKeepMostRecent(allBoards);
	return deduped;
});
export const currentBoardId = writable('');
export const currentBoard = derived(currentBoardId, ($currentBoardId) => {
	return get(events).find((e) => e.dTag === $currentBoardId);
});
export const columns = derived(events, ($events) => {
	const allColumns = $events.filter((e) => e.kind === 30044);
	const deduped = deduplicateKeepMostRecent(allColumns);
	return deduped;
});
export const columnsForBoard = derived(
	[events, boards, columns, currentBoardId],
	([$events, $boards, $columns, $currentBoardId]) => {
		let currentBoard = $boards.find((e) => e.dTag === $currentBoardId);
		let boardColumnIds = columnsDsFromBoard(currentBoard);
		const cols = boardColumnIds.map((d) => {
			return $columns.find((c) => c.tagAddress() === d);
		});
		return cols;
	}
);
export const selectedColumn = writable('');
export const cards = derived(events, ($events) => {
	const allCards = $events.filter((e) => e.kind === 30045);
	const deduped = deduplicateKeepMostRecent(allCards);
	return deduped;
});

export const cardsForColumn = (columnId) => {
	const cols = get(columns);
	const column = cols.find((c) => c.id === columnId);
	const cardIds = column.tags.filter((e) => e[0] === 'a').map((e) => e[1]);
	let cardsForCol = cardIds.map((id) => {
		return get(cards).find((e) => e.tagAddress() === id);
	});
	if (cardsForCol.length === 0) {
		return [];
	} else {
		return cardsForCol;
	}
};

export const db = writable({
	user: null,
	ndk: await initNDK(),
	currentBoardId: null
});

async function initNDK() {
	const ndk = new NDK({
		explicitRelayUrls: ['ws://localhost:10547']
	});
	await ndk.connect();
	return ndk;
}

export function setBoard(board) {
	db.update((db) => ({ ...db, board }));
}

function deduplicateKeepMostRecent(array) {
	const mostRecentMap = new Map();
	array.forEach((obj) => {
		const key = obj.deduplicationKey();
		if (!mostRecentMap.has(key) || obj.created_at > mostRecentMap.get(key).created_at) {
			mostRecentMap.set(key, obj);
		}
	});
	return Array.from(mostRecentMap.values());
}
