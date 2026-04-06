import { SERVER_URL } from "./constant.js";

/**
 * Register a new user by sending credentials as URL search parameters.
 *
 * @param {string} username - The username assigned to the new user.
 * @param {string} password - The user's account password.
 * @returns {Promise<Object>} - A promise that resolves to the JSON response from the server.
 * @throws {Error} - Throws an error if the server's response status is not "ok".
 *
 * @example
 * try {
 *   const result = await signUpUser('alice', 'secret123');
 *   console.log('Signup successful:', result);
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export async function signUpUser(username, password) {
	const url = new URL(`${SERVER_URL}/signup`);
	url.searchParams.append("user", username);
	url.searchParams.append("password", password);

	const response = await fetch(url, {
		method: "GET",
	});

	if (!response.ok) {
		throw new Error(`Signup failed with status ${response.status}`);
	}

	return await response.json();
}
