import NDK, { NDKNip07Signer, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
import { get } from 'svelte/store';
import {
	db,
	events as eventStore,
	columns as columnStore,
	currentBoardAddress,
	currentBoard,
	selectedColumn,
	user as userStore,
	ndkStore
} from '$lib/db';

export async function login(method) {
	const nip07signer = new NDKNip07Signer();
	const ndk = get(ndkStore);
	ndk.signer = nip07signer;

	/** @type {NDKUser | null} */
	let user = {};
	switch (method) {
		case 'browser-extension': {
			console.log('login with extension');
			user = await nip07signer.user();
			await user.fetchProfile();
			userStore.set(user);
			console.log('user', user);
			db.update((db) => {
				return { ...db, ndk, user };
			});
		}
	}
}

function getNdk() {
	return get(ndkStore);
}

export function addBoard(board) {
	const ndk = get(ndkStore);
	const event = new NDKEvent(ndk, { kind: 30043, content: 'Board Event' });
	const tags = [['title', board.title]];
	event.tags = tags;
	event.publish();
}

export async function addColumn(column) {
	const ndk = getNdk();
	const user = get(userStore);
	const columnEvent = new NDKEvent(ndk, { kind: 30044, content: 'Column Event' });
	columnEvent.tags = [['title', column.title]];
	await columnEvent.publish();

	// add column to Board
	const boardD = get(currentBoard).dTag;
	console.log('board dtag', boardD);
	// const existingBoard = await ndk.fetchEvent({
	// 	kinds: [30043],
	// 	authors: [user.pubkey],
	// 	'#d': [get(currentBoard).dTag]
	// });
	const existingBoard = new NDKEvent(ndk, get(currentBoard));
	existingBoard.tags.push(['a', `30044:${user.pubkey}:${columnEvent.dTag}`]);
	existingBoard.publishReplaceable();
}

/**
 * @param {NDKEvent} card
 * @param {NDKEvent} column
 */
export async function addCard(card, column) {
	const ndk = getNdk();
	const cardEvent = new NDKEvent(ndk, card);
	console.log('add card event', cardEvent);
	await cardEvent.publishReplaceable();

	console.log('column event', column);
	column.tags.push(['a', `${cardEvent.kind}:${cardEvent.pubkey}:${cardEvent.dTag}`]);
	column.publishReplaceable();
}

async function eventTagToCard(eventTag) {
	const ndk = getNdk();
	const [kind, pubkey, d] = eventTag.split(':');
	const event = await ndk.fetchEvent({
		kinds: [30045],
		pubkey,
		d
	});
	return { id: event.id, content: event.content, event };
}

async function eventTagToColumn(eventTag) {
	const ndk = getNdk();
	const [kind, pubkey, d] = eventTag.split(':');
	const event = await ndk.fetchEvent({
		kind,
		pubkey,
		d
	});
	const title = event.tags.find((e) => e[0] === 'title')[1];
	const itemEventTags = event.tags
		.filter((e) => e[0] == 30045) // only card events
		.filter((e) => e[0] === 'a' || e[0] === 'e')
		.map((e) => e[1]);
	let items = [];
	if (itemEventTags.length > 0) {
		items = await Promise.all(itemEventTags.map(eventTagToCard));
	} else {
		items = [];
	}
	return { id: d, title, items, event };
}

/**
 * Gets the title tag of an event
 * @param {NDKEvent} event
 * @returns {string}
 */
export function eventTitle(event) {
	if (event === undefined) return '';
	const title = event.tags?.find((e) => e[0] === 'title')?.[1] ?? '';
	return title;
}

// Löschen?
async function eventToBoard(event) {
	const id = event.tags.find((e) => e[0] === 'd')[1];
	const eventId = event.id;
	const title = event.tags.find((e) => e[0] === 'title')[1];
	const columnEventTags = event.tags.filter((e) => e[0] === 'a').map((e) => e[1]);
	let columns;
	if (columnEventTags.length) {
		columns = await Promise.all(columnEventTags.map(eventTagToColumn));
	} else {
		columns = [];
	}
	return { eventId, title, created_at: event.created_at, event };
}

export async function getBoards() {
	const ndk = get(ndkStore);
	const sub = ndk.subscribe({ kinds: [30043, 30044, 30045] }); // listen for boards, columns indexes
	sub.on('event', async (event) => {
		eventStore.update((events) => [...events, event]);
	});
}
/** returns the event adresses of the columns from the board
/* 
 */
export function columnAddressesFromBoard(board) {
	const columnDs = board.tags.filter((t) => t[0] === 'a').map((t) => t[1]);
	return columnDs;
}

/** Gets the addresses events from another event
/* @param {NDKEvent} event 
 */
async function addressedEvents(event) {
	const ndk = getNdk();
	let columnAddresses = columnAddressesFromBoard(event);
	const cols = await Promise.all(
		columnAddresses.map(async (c) => {
			const [kind, pubkey, dTag] = c.split(':');
			console.log(kind, pubkey, dTag);
			const col = await ndk.fetchEvent({
				kinds: [Number(kind)],
				authors: [pubkey],
				'#d': [dTag]
			});
			return col;
		})
	);
	console.log('got addressedEvents', cols);

	if (cols.includes(undefined)) return [];
	return cols;
}

export async function publishBoard(board) {
	const ndk = getNdk();
	console.log(get(currentBoardAddress));
	const existingBoard = get(currentBoard);
	// const existingBoard = await ndk.fetchEvent({
	// 	kinds: [30043],
	// 	authors: [board.pubkey],
	// 	'#d': [board.dTag] // TODO does this work with address? guess it needs to be the tag
	// });
	const columnIds = board.items.map((e) => e.dTag);
	let tags = existingBoard.tags.filter((t) => t[0] !== 'a');
	columnIds.forEach((dTag) => {
		// TODO use user pubkey here so that
		// after a fork the correct column tags are assigned?
		tags.push(['a', `30044:${board.pubkey}:${dTag}`]);
	});
	existingBoard.tags = tags;
	existingBoard.publishReplaceable();
}

export async function publishCards(column) {
	column.publishReplaceable();
}

/** takes existing tags and replaces the pubkey in the Tag Addresses
 * @param {Array<import('@nostr-dev-kit/ndk').NDKTag>} tags
 * @param {string} pubkey
 * @returns {Array<import('@nostr-dev-kit/ndk').NDKTag>}
 */
function forkTags(tags, pubkey) {
	return tags.map((t) => {
		if (t[0] === 'a') {
			const [kind, pubkeyOrigin, dTag] = t[1].split(':');
			return [t[0], `${kind}:${pubkey}:${dTag}`];
		} else {
			return t;
		}
	});
}

/**
 * Forks a board and all its content
 * @param {NDKEvent} board
 */
export async function forkBoard(board) {
	const ndk = getNdk();
	const user = get(userStore);

	const userBoard = new NDKEvent(ndk, {
		kind: board.kind,
		content: board.content,
		tags: forkTags(board.tags, user.pubkey)
	});

	// fork columns
	const boardColumns = await addressedEvents(board);
	const newColumns = boardColumns.map((originCol) => {
		const col = new NDKEvent(ndk, {
			kind: originCol.kind,
			content: originCol.content,
			tags: forkTags(originCol.tags, user.pubkey)
		});
		return col;
	});

	// fork cards
	/** @type {Array<NDKEvent>} */
	const cardEvents = [];
	await Promise.all(
		boardColumns.map(async (col) => {
			const oldCards = await addressedEvents(col);
			oldCards.forEach((oldCard) => {
				cardEvents.push(
					new NDKEvent(ndk, {
						kind: oldCard.kind,
						content: oldCard.content,
						tags: forkTags(oldCard.tags, user.pubkey)
					})
				);
			});
		})
	);

	userBoard.publish();
	newColumns.forEach((col) => col.publish());
	cardEvents.forEach((card) => card.publish());
}

/**
 * Delete a board
 * @param {NDKEvent} board
 */
export async function deleteBoard(board) {
	const ndk = getNdk();
	await new NDKEvent(ndk, board).delete('user said so', true);
}
