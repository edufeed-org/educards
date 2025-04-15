import NDK, { NDKNip07Signer, NDKEvent } from '@nostr-dev-kit/ndk';
import { get } from 'svelte/store';
import { db, events, currentBoardId, currentBoard, selectedColumn } from '$lib/db';

export async function login(method) {
	const nip07signer = new NDKNip07Signer();
	const ndk = get(db).ndk;
	ndk.signer = nip07signer;

	switch (method) {
		case 'browser-extension': {
			console.log('login with extension');
			const user = await nip07signer.user();
			db.update((db) => {
				return { ...db, ndk, user };
			});
		}
	}
}

export function addBoard(board) {
	const ndk = get(db).ndk;
	const event = new NDKEvent(ndk, { kind: 30043, content: 'Board Event' });
	const tags = [['title', board.title]];
	event.tags = tags;
	event.publish();
}

export async function addColumn(column) {
	const ndk = get(db).ndk;
	const columnEvent = new NDKEvent(ndk, { kind: 30044, content: 'Column Event' });
	columnEvent.tags = [['title', column.title]];
	await columnEvent.publish();

	// add column to Board
	const existingBoard = await ndk.fetchEvent({
		kinds: [30043],
		authors: [columnEvent.pubkey],
		'#d': [get(currentBoardId)]
	});
	existingBoard.tags.push(['a', `30044:${columnEvent.pubkey}:${columnEvent.dTag}`]);
	existingBoard.publishReplaceable();
}

export async function addCard(card) {
	const ndk = get(db).ndk;
	const cardEvent = new NDKEvent(ndk, { kind: 30045, content: card.title });
	await cardEvent.publish();

	const columnEvent = await ndk.fetchEvent({
		kinds: [30044],
		authors: [cardEvent.pubkey],
		'#d': [get(selectedColumn)]
	});
	columnEvent.tags.push(['a', `${cardEvent.kind}:${cardEvent.pubkey}:${cardEvent.dTag}`]);
	columnEvent?.publishReplaceable();
}

async function eventTagToCard(eventTag) {
	const ndk = get(db).ndk;
	const [kind, pubkey, d] = eventTag.split(':');
	const event = await ndk.fetchEvent({
		kinds: [30045],
		pubkey,
		d
	});
	return { id: event.id, content: event.content, event };
}

async function eventTagToColumn(eventTag) {
	const ndk = get(db).ndk;
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

export function eventTitle(event) {
	const title = event.tags.find((e) => e[0] === 'title')[1];
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
	const ndk = get(db).ndk;
	const sub = ndk.subscribe({ kinds: [30043, 30044, 30045] }); // listen for boards, columns indexes
	sub.on('event', async (event) => {
		events.update((events) => [...events, event]);
	});
}
// returns the d tags of the columns from the board
export function columnsDsFromBoard(board) {
	const columnDs = board.tags.filter((t) => t[0] === 'a').map((t) => t[1]);
	return columnDs;
}

export async function publishBoard(board) {
	const ndk = get(db).ndk;
	const existingBoard = await ndk.fetchEvent({
		kinds: [30043],
		authors: [board.pubkey],
		'#d': [get(currentBoardId)]
	});
	const columnIds = board.items.map((e) => e.dTag);
	let tags = existingBoard.tags.filter((t) => t[0] !== 'a');
	columnIds.forEach((dTag) => {
		tags.push(['a', `30044:${board.pubkey}:${dTag}`]);
	});
	existingBoard.tags = tags;
	existingBoard.publishReplaceable();
}

export async function publishCards(column) {
	const ndk = get(db).ndk;
	const existingColumn = await ndk.fetchEvent({
		kinds: [30044],
		authors: [column.pubkey],
		ids: [column.id]
	});
	const cardIds = column.items.map((e) => e.dTag);
	let tags = existingColumn.tags.filter((t) => t[0] !== 'a');
	cardIds.forEach((dTag) => {
		tags.push(['a', `30045:${column.pubkey}:${dTag}`]);
	});
	existingColumn.tags = tags;
	existingColumn.publishReplaceable();
}
