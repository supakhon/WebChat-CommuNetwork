import { SERVER_URL } from "./constant.js";

/**
 * Log in a user by sending credentials as URL search parameters.
 *
 * @param {string} username - The username assigned to the user.
 * @param {string} password - The user's account password.
 * @returns {Promise<Object>} - A promise that resolves to the JSON response from the server.
 * @throws {Error} - Throws an error if the server's response code indicates failure.
 *
 * @example
 * try {
 *   const result = await loginUser('alice', 'secret123');
 *   console.log('Login successful:', result);
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export async function loginUser(username, password) {
	const url = new URL(`${SERVER_URL}/login`);
	url.searchParams.append("username", username);
	url.searchParams.append("password", password);

	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(`Login failed with status ${response.status}`);
	}

	return await response.json();
}
