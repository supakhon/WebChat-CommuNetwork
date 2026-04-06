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
export async function sendMessage(targetId, type, data) {
	const payload = {
		target_id: targetId,
		type: type,
		data: data,
	};

	const response = await fetch(`${SERVER_URL}/messages/send`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to send message with status ${response.status}`,
		);
	}

	return await response.json();
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
	const response = await fetch(`${SERVER_URL}/messages/create_group`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ users }),
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
 *   const result = await getLeftOverMessages();
 *   console.log('Fetched and stored messages:', result);
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export async function getLeftOverMessages() {
	const response = await fetch(`${SERVER_URL}/messages/get_left_over`, {
		method: "GET",
	});

	if (!response.ok) {
		throw new Error(
			`Failed to get leftover messages with status ${response.status}`,
		);
	}

	const messages = await response.json();

	const existingStorage = JSON.parse(
		localStorage.getItem("messages") || "{}",
	);

	messages.forEach((message) => {
		const storageKey = message.target_id || message.user_id;
		const messageData = {
			user_id: message.user_id,
			type: message.type,
			data: message.data,
			timestamp: message.timestamp,
		};

		if (!existingStorage[storageKey]) {
			existingStorage[storageKey] = [];
		}

		existingStorage[storageKey].push(messageData);
	});

	localStorage.setItem("messages", JSON.stringify(existingStorage));

	return messages;
}
