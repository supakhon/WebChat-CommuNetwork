import { loginUser } from "./scripts/login.js";
import { signUpUser } from "./scripts/signup.js";
import {
	sendMessage,
	createGroup,
	getPendingMessages,
} from "./scripts/chat.js";
import { getCurrentUser, searchUsers } from "./scripts/user.js";

// Login Section
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const loginButton = document.getElementById("login-button");

// Signup Section
const signupUsernameInput = document.getElementById("signup-username");
const signupPasswordInput = document.getElementById("signup-password");
const signupButton = document.getElementById("signup-button");

// Chat Section - Message Input
const messageTargetIdInput = document.getElementById("message-target-id");
const messageDataTextarea = document.getElementById("message-data");
const messageFileInput = document.getElementById("message-file-input");
const clearFileButton = document.getElementById("clear-file-button");
const sendButton = document.getElementById("send-button");

// Create Group Section
const groupUsersInput = document.getElementById("group-users");
const createGroupButton = document.getElementById("create-group-button");

// User Section
const getUserButton = document.getElementById("get-user-button");
const userInfoDisplay = document.getElementById("user-info-display");
const searchQueryInput = document.getElementById("search-query");
const searchButton = document.getElementById("search-button");
const searchResultsList = document.getElementById("search-results-list");

// Output & Visibility
const messagesDisplayPanel = document.getElementById("messages-display-panel");
const clearMessagesButton = document.getElementById("clear-messages-button");

// Reads 'messages_peer' and 'messages_group' from localStorage and displays them.
function updateMessagesDisplay() {
	const peerMessages = JSON.parse(localStorage.getItem("messages_peer") || "{}");
	const groupMessages = JSON.parse(localStorage.getItem("messages_group") || "{}");

	if (Object.keys(peerMessages).length === 0 && Object.keys(groupMessages).length === 0) {
		messagesDisplayPanel.innerHTML = "<p>No messages stored.</p>";
		return;
	}

	messagesDisplayPanel.innerHTML = "";

	// Render Peer Messages
	if (Object.keys(peerMessages).length > 0) {
		const peerSectionHeader = document.createElement("h3");
		peerSectionHeader.textContent = "Direct Messages";
		messagesDisplayPanel.appendChild(peerSectionHeader);

		Object.keys(peerMessages).forEach((partnerId) => {
			const targetHeader = document.createElement("h4");
			targetHeader.textContent = `Chat with User: ${partnerId}`;
			messagesDisplayPanel.appendChild(targetHeader);

			renderMessageList(peerMessages[partnerId]);
		});
	}

	// Render Group Messages
	if (Object.keys(groupMessages).length > 0) {
		const groupSectionHeader = document.createElement("h3");
		groupSectionHeader.textContent = "Group Chats";
		messagesDisplayPanel.appendChild(groupSectionHeader);

		Object.keys(groupMessages).forEach((groupId) => {
			const targetHeader = document.createElement("h4");
			targetHeader.textContent = `Group: ${groupId}`;
			messagesDisplayPanel.appendChild(targetHeader);

			renderMessageList(groupMessages[groupId]);
		});
	}
}

function renderMessageList(messages) {
	let lastMessageDiv = null;

	messages.forEach((message) => {
		const messageDiv = document.createElement("div");
		messageDiv.className = "message-block";

		let content = message.data;
		if (message.type === "file") {
			const fileInfo = message.data;
			if (fileInfo.type && fileInfo.type.startsWith("image/")) {
				content = `
					<img src="${fileInfo.data}" style="max-width: 100%; height: auto; display: block; margin-top: 5px; border-radius: 4px;" alt="${fileInfo.filename}" />
					<a href="${fileInfo.data}" download="${fileInfo.filename}" style="display: inline-block; margin-top: 5px; font-size: 0.9em;">Download ${fileInfo.filename}</a>
				`;
			} else {
				content = `<a href="${fileInfo.data}" download="${fileInfo.filename}">Download File: ${fileInfo.filename} (${fileInfo.type})</a>`;
			}
		}

		messageDiv.innerHTML = `
			<div class="message-info">
				<strong>Sender ID: ${message.sender_id}</strong> | ${message.timestamp}
			</div>
			<div class="message-content">
				${content}
			</div>
		`;
		messagesDisplayPanel.appendChild(messageDiv);
		lastMessageDiv = messageDiv;
	});

	if (lastMessageDiv) {
		requestAnimationFrame(() => {
			lastMessageDiv.scrollIntoView({ behavior: "smooth", block: "end" });
		});
	}
}

// Updates the visibility of the Clear button.
function updateClearButtonVisibility() {
	const hasFile = messageFileInput.files.length > 0;
	const hasText = messageDataTextarea.value.length > 0;
	clearFileButton.style.display =
		hasFile || hasText ? "inline-block" : "none";
}

// Periodically fetches pending messages from the server every 1 seconds.
async function startPendingMessagesPolling() {
	while (true) {
		try {
			const messages = await getPendingMessages();
			if (messages.length > 0) {
				console.log("System: Pending messages fetched", {
					count: messages.length,
				});
				updateMessagesDisplay();
			}
		} catch (error) {
			console.error("System Error:", error.message);
		}
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
}

// --- Event Handlers ---

// Login
loginButton.onclick = async (event) => {
	if (event) event.preventDefault();
	const username = loginUsernameInput.value;
	const password = loginPasswordInput.value;

	try {
		const result = await loginUser(username, password);
		console.log("Success: Logged in", {
			user: username,
			response: result,
		});
		alert("Login Success!");
		updateMessagesDisplay();
	} catch (error) {
		console.error("Login Error:", error.message);
		alert("Login Failed: " + error.message);
	}
};

// Signup
signupButton.onclick = async (event) => {
	if (event) event.preventDefault();
	const username = signupUsernameInput.value;
	const password = signupPasswordInput.value;

	try {
		const result = await signUpUser(username, password);
		console.log("Success: Account created", {
			user: username,
			response: result,
		});
		alert("Signup Success!");
		updateMessagesDisplay();
	} catch (error) {
		console.error("Signup Error:", error.message);
		alert("Signup Failed: " + error.message);
	}
};

// Handle Text Input: Update clear button visibility
messageDataTextarea.oninput = () => {
	updateClearButtonVisibility();
};

// Handle File Selection: Disable text input when a file is picked
messageFileInput.onchange = () => {
	const hasFile = messageFileInput.files.length > 0;
	messageDataTextarea.disabled = hasFile;

	if (hasFile) {
		messageDataTextarea.placeholder = "File selected (Text disabled)";
		messageDataTextarea.value = "";
	} else {
		messageDataTextarea.placeholder = "Type your message here...";
	}

	updateClearButtonVisibility();
};

// Handle Clear Button: Clears both text and file input
clearFileButton.onclick = (event) => {
	if (event) event.preventDefault();
	messageFileInput.value = "";
	messageDataTextarea.value = "";
	messageFileInput.onchange();
};

// Send Message
sendButton.onclick = async (event) => {
	if (event) event.preventDefault();
	const targetId = messageTargetIdInput.value;
	const file = messageFileInput.files[0];

	let payloadData;
	let messageType;

	if (file) {
		messageType = "file";
		payloadData = await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				resolve({
					filename: file.name,
					type: file.type,
					data: reader.result,
				});
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	} else {
		messageType = "text";
		payloadData = messageDataTextarea.value;
	}

	try {
		const result = await sendMessage(
			targetId || null,
			messageType,
			payloadData
		);
		console.log("Success: Message sent", { response: result });
		alert("Message Sent!");
		updateMessagesDisplay();

		// Cleanup after send
		if (file) {
			clearFileButton.onclick();
		}
	} catch (error) {
		console.error("Send Error:", error.message);
		alert("Send Failed: " + error.message);
	}
};

// Create Group
createGroupButton.onclick = async (event) => {
	if (event) event.preventDefault();
	const rawUsers = groupUsersInput.value;
	if (!rawUsers) {
		console.error("Error: No user IDs specified for group");
		alert("Group Creation Failed: No user IDs specified");
		return;
	}

	// Split by comma and trim whitespace
	const users = rawUsers
		.split(",")
		.map((id) => id.trim())
		.filter((id) => id.length > 0);

	try {
		const result = await createGroup(users);
		console.log("Success: Group created", { response: result });
		alert("Group Created Successfully!");
	} catch (error) {
		console.error("Group Creation Error:", error.message);
		alert("Group Creation Failed: " + error.message);
	}
};

// Get Current User
getUserButton.onclick = async () => {
	try {
		const user = await getCurrentUser();
		userInfoDisplay.textContent = `ID: ${user.id}, Username: ${user.username}`;
		console.log("Success: Fetched current user", user);
	} catch (error) {
		console.error("Get User Error:", error.message);
		alert("Failed to get user info: Ensure you are logged in.");
	}
};

// Search Users
searchButton.onclick = async () => {
	const query = searchQueryInput.value;
	try {
		const users = await searchUsers(query);
		searchResultsList.innerHTML = "";
		users.forEach((user) => {
			const listItem = document.createElement("li");
			listItem.textContent = `ID: ${user.id}, Username: ${user.username}`;
			searchResultsList.appendChild(listItem);
		});
		console.log("Success: Searched users", { query, results: users });
	} catch (error) {
		console.error("Search User Error:", error.message);
		alert("Search Failed: " + error.message);
	}
};

// Clear All Messages
clearMessagesButton.onclick = () => {
	if (confirm("Are you sure you want to clear all stored messages?")) {
		localStorage.removeItem("messages_peer");
		localStorage.removeItem("messages_group");
		updateMessagesDisplay();
		console.log("Success: Stored messages cleared");
	}
};

// --- Initialization ---
updateMessagesDisplay();
startPendingMessagesPolling();
getUserButton.click(); // Fetch current user on page load
searchButton.click(); // Show all users on page load (empty query)
