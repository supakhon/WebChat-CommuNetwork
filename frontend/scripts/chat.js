import { SERVER_URL } from "./constant.js";

/**
 * Send a message to the server via POST.
 * Identity is extracted from cookies on the server side.
 *
 * @param {string|null} targetId - Unique identifier for the person or group receiving the message.
 * @param {'text'|'file'} type - The content type of the message.
 * @param {string|Object} data - Message content (string for text, or {filename, type, data} for file).
 * @returns {Promise<Object>} - A promise resolving to the server's response JSON.
 * @throws {Error} - Throws an error if the status is not ok.
 *
 * @example
 * // Sending a text message
 * await sendMessage('user_123', 'text', 'Hello World!');
 */
/**
 * Send a message to the server via POST.
 * Identity is extracted from cookies on the server side.
 *
 * @param {string|null} targetId - Unique identifier for the person or group receiving the message.
 * @param {'text'|'file'} type - The content type of the message.
 * @param {string|Object} data - Message content (string for text, or {filename, type, data} for file).
 * @returns {Promise<Object>} - A promise resolving to the server's response JSON.
 * @throws {Error} - Throws an error if the status is not ok.
 *
 * @example
 * // Sending a text message
 * await sendMessage('user_123', 'text', 'Hello World!');
 */
export async function sendMessage(targetId, type, data) {
	const payload = {
		target_id: targetId,
		type: type,
		data: data,
	};

	const response = await fetch(`${SERVER_URL}/message/send`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(
			`Failed to send message with status ${response.status}`,
		);
	}

	const result = await response.json();
	if (result.message) {
		saveMessages([result.message]);
	}

	return result;
}

/**
 * Persist an array of messages in localStorage.
 * Messages are grouped by peer (sender_id/target_id) or group (target_id).
 *
 * @param {Array} messages - List of message objects.
 */
function saveMessages(messages) {
	if (!messages || messages.length === 0) return;

	const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
	const currentUserId = String(currentUser.id);

	const peerStorage = JSON.parse(localStorage.getItem("messages_peer") || "{}");
	const groupStorage = JSON.parse(localStorage.getItem("messages_group") || "{}");

	// Helper to check if an ID is a UUID (Group ID)
	const isUuid = (id) =>
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
			id,
		);

	messages.forEach((message) => {
		const senderId = String(message.sender_id);
		const targetId = String(message.target_id);

		// Deduction logic:
		// If target_id is a UUID, it's a group message.
		// If it's a simple number (ID), it's a peer message.
		const isGroup = isUuid(targetId);

		const messageData = {
			sender_id: message.sender_id,
			type: message.type,
			data: message.data,
			timestamp: message.timestamp,
		};

		if (isGroup) {
			if (!groupStorage[targetId]) {
				groupStorage[targetId] = [];
			}
			groupStorage[targetId].push(messageData);
		} else {
			// It's a peer message. Identify the partner.
			const partnerId = senderId === currentUserId ? targetId : senderId;
			if (!peerStorage[partnerId]) {
				peerStorage[partnerId] = [];
			}
			peerStorage[partnerId].push(messageData);
		}
	});

	localStorage.setItem("messages_peer", JSON.stringify(peerStorage));
	localStorage.setItem("messages_group", JSON.stringify(groupStorage));
}

/**
 * Create a new messaging group.
 *
 * @param {string[]} users - List of all user IDs to include in the group (excluding self).
 * @returns {Promise<Object>} - A promise resolving to the server's response JSON (e.g., the new group ID).
 * @throws {Error} - Throws an error if the group creation fails.
 *
 * @example
 * // Create a group with user2 and user3
 * const result = await createGroup(['user2', 'user3']);
 */
export async function createGroup(users) {
	const response = await fetch(`${SERVER_URL}/message/create_group`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ users }),
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(
			`Failed to create group with status ${response.status}`,
		);
	}

	return await response.json();
}

/**
 * Fetch leftover messages from the server and persist them in localStorage.
 * Messages are grouped by target_id.
 *
 * @returns {Promise<Array>} - A promise resolving to the list of fetched message objects.
 * @throws {Error} - Throws an error if the request fails.
 *
 * @example
 * try {
 *   const result = await getPendingMessages();
 *   console.log('Fetched and stored messages:', result);
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export async function getPendingMessages() {
	const response = await fetch(`${SERVER_URL}/message/get_pending`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(
			`Failed to get pending messages with status ${response.status}`,
		);
	}

	const messages = await response.json();

	saveMessages(messages);

	return messages;
}
