import { apiFetch } from "./api.js";

export async function getCurrentUser() {
    const user = await apiFetch("/user");
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    return user;
}

export async function searchUsers(search_query) {
    return await apiFetch(`/user/search?query=${search_query}`);
}

export async function logoutUser() {
    const result = await apiFetch("/user/logout");
    
    // Clear auth data
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("currentUser");
    
    return result;
}
