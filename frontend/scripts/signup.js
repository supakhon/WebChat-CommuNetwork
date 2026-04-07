import { SERVER_URL } from "./constant.js";

/**
 * Register a new user by sending credentials via POST.
 * 
 * @param {string} username - The username assigned to the new user.
 * @param {string} password - The user's account password.
 * @returns {Promise<Object>} - A promise that resolves to the JSON response from the server.
 */
export async function signUpUser(username, password) {
	const response = await fetch(`${SERVER_URL}/signup`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || `Signup failed with status ${response.status}`);
	}

	return await response.json();
}
