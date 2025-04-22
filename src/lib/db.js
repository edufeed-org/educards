import { writable, derived, get } from 'svelte/store';
import NDK, { NDKUser } from '@nostr-dev-kit/ndk';
import { columnAddressesFromBoard } from './ndk';

export const events = writable([]);

export const boards = derived(events, ($events) => {
	const allBoards = $events.filter((e) => e.kind === 30043);
	const deduped = deduplicateKeepMostRecent(allBoards);
	return deduped;
});
export const currentBoardAddress = writable('');
export const currentBoard = derived(currentBoardAddress, ($currentBoardAddress) => {
	console.log('looking for current board');
	const board = get(events).find((e) => e.tagAddress() === $currentBoardAddress);
	console.log(board);
	return board;
});
export const columns = derived(events, ($events) => {
	const allColumns = $events.filter((e) => e.kind === 30044);
	const deduped = deduplicateKeepMostRecent(allColumns);
	const sorted = deduped.sort((a, b) => {
		return b.created_at - a.created_at;
	});
	return sorted;
});
export const columnsForBoard = derived(
	[events, boards, columns, currentBoardAddress],
	([$events, $boards, $columns, $currentBoardAddress]) => {
		let currentBoard = $boards.find((e) => e.tagAddress() === $currentBoardAddress);
		if (currentBoard === undefined) {
			return [];
		}
		let boardColumnIds = columnAddressesFromBoard(currentBoard);
		const cols = boardColumnIds.map((d) => {
			return $columns.find((c) => c.tagAddress() === d);
		});
		if (cols.includes(undefined)) return [];
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

/** @type {NDKUser} */
export const user = writable(null);

export const userBoards = derived([user, boards], ([$user, $boards]) => {
	if ($user?.pubkey) {
		const newUserBoards = $boards.filter((b) => b.pubkey === $user.pubkey);
		return newUserBoards;
	}
	return [];
});

export const db = writable({
	currentBoardId: null
});

// Create a writable store for the NDK instance
const createNDKStore = () => {
	const { subscribe, set, update } = writable(null);

	return {
		subscribe,
		init: async (
			// FIXME use a defualt relay list from config
			relayUrls = [
				// 'wss://relay.damus.io'
				// 'wss://relay.nostr.band',
				// 'wss://nos.lol',
				// 'ws://localhost:10547'
				'wss://purplepag.es',
				'wss://relay-k12.edufeed.org'
				// Add more default relays here
			]
		) => {
			try {
				const ndk = new NDK({
					explicitRelayUrls: relayUrls,
					autoConnectUserRelays: true
				});

				// Connect to relays
				await ndk.connect();
				console.log('NDK Connected to relays');

				// Update the store with the connected instance
				set(ndk);
				return ndk;
			} catch (error) {
				console.error('Failed to initialize NDK:', error);
				throw error;
			}
		}

		// // Method to sign in with extension (NIP-07)
		// signInWithExtension: async () => {
		// 	return update((ndk) => {
		// 		if (!ndk) throw new Error('NDK not initialized');

		// 		const signer = new NDKNip07Signer();
		// 		ndk.signer = signer;
		// 		return ndk;
		// 	});
		// },

		// // Method to disconnect/cleanup
		// disconnect: () => {
		// 	update((ndk) => {
		// 		if (ndk) {
		// 			// Perform any cleanup if needed
		// 		}
		// 		return null;
		// 	});
		// }
	};
};

// Export the NDK store
export const ndkStore = createNDKStore();

export async function initNDK() {
	const ndk = get(ndkStore);
	const sub = ndk.subscribe({ kinds: [30043, 30044, 30045] }); // listen for boards, columns indexes
	sub.on('event', async (event) => {
		events.update((events) => [...events, event]);
	});

	const subDelete = ndk.subscribe({ kinds: [5] });
	subDelete.on('event', async (event) => {
		const toBeDeletedDs = event.getMatchingTags('a').map((e) => e[1]);
		events.update((events) => {
			return events.filter((e) => !toBeDeletedDs.includes(e.tagAddress()));
		});
	});

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
