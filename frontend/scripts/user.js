import { SERVER_URL } from "./constant.js";

export async function getCurrentUser() {
    const response = await fetch(`${SERVER_URL}/user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user info");
    }

    const user = await response.json();
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    return user;
}

export async function searchUsers(search_query) {
    const response = await fetch(`${SERVER_URL}/user/search?query=${search_query}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to search users");
    }

    return await response.json();
}
