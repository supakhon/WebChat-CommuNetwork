import { SERVER_URL } from "./constant.js";

/**
 * Centralized API utility for making authenticated requests.
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/user', '/message/send').
 * @param {Object} options - Fetch options (method, body, headers, etc.).
 * @returns {Promise<any>} - JSON response from the server.
 */
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${SERVER_URL}${endpoint}`;

    const token = localStorage.getItem("auth_token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Remove token if unauthorized
        if (response.status === 401) {
            localStorage.removeItem("auth_token");
            sessionStorage.removeItem("currentUser");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
}
