import { SERVER_URL } from "./constant.js";

/**
 * Log in a user by sending credentials via POST.
 * 
 * @param {string} username - The username assigned to the user.
 * @param {string} password - The user's account password.
 * @returns {Promise<Object>} - A promise that resolves to the JSON response from the server.
 */
export async function loginUser(username, password) {
	const response = await fetch(`${SERVER_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || `Login failed with status ${response.status}`);
	}

	const result = await response.json();
	
	if (result.token) {
		localStorage.setItem("auth_token", result.token);
	}
	
	return result;
}
