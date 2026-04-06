import { SERVER_URL } from "./constant.js";

/**
 * Send a message to the server via POST.
 *
 * @param {string} senderId - Unique identifier for the person sending the message.
 * @param {string|null} groupId - Unique identifier for the group (null if private).
 * @param {'text'|'file'} type - The content type of the message.
 * @param {string|Object} data - Message content (string for text, or {filename, type, data} for file).
 * @returns {Promise<Object>} - A promise resolving to the server's response JSON.
 * @throws {Error} - Throws an error if the status is not ok.
 *
 * @example
 * // Sending a text message
 * await sendMessage('alice', null, 'text', 'Hello World!');
 *
 * @example
 * // Sending a file
 * const fileData = { filename: 'pic.png', type: 'image/png', data: 'base64str...' };
 * await sendMessage('alice', 'group_123', 'file', fileData);
 */
export async function sendMessage(senderId, groupId, type, data) {
	const payload = {
		user_id: senderId,
		group_id: groupId,
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
 * Fetch leftover messages from the server and persist them in localStorage.
 * Messages are grouped by group_id if available, otherwise by user_id.
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
		const storageKey = message.group_id || message.user_id;
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
