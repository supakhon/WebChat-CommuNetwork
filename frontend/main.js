import { loginUser } from "./scripts/login.js";
import { signUpUser } from "./scripts/signup.js";
import { sendMessage, getLeftOverMessages } from "./scripts/chat.js";

// Login Section
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const loginButton = document.getElementById("login-button");

// Signup Section
const signupUsernameInput = document.getElementById("signup-username");
const signupPasswordInput = document.getElementById("signup-password");
const signupButton = document.getElementById("signup-button");

// Chat Section - Message Input
const messageSenderIdInput = document.getElementById("message-sender-id");
const messageDataTextarea = document.getElementById("message-data");
const messageFileInput = document.getElementById("message-file-input");
const clearFileButton = document.getElementById("clear-file-button");
const sendButton = document.getElementById("send-button");

// Output & Visibility
const localStoragePane = document.getElementById("local-storage-pane");

// Update localStorage pane with current messages
function updateMessagesDisplay() {
	localStoragePane.textContent = localStorage.getItem("messages") || "{}";
}

// Update clear button visibility
function updateClearButtonVisibility() {
	const hasFile = messageFileInput.files.length > 0;
	const hasText = messageDataTextarea.value.length > 0;
	clearFileButton.style.display = hasFile || hasText ? "inline-block" : "none";
}

// Polling function to fetch leftover messages every 5 seconds
async function startLeftOverMessagesPolling() {
	while (true) {
		try {
			const messages = await getLeftOverMessages();
			if (messages.length > 0) {
				console.log("System: Leftover messages fetched", {
					count: messages.length,
				});
				updateMessagesDisplay();
			}
		} catch (error) {
			console.error("System Error:", error.message);
		}
		await new Promise((resolve) => setTimeout(resolve, 5000));
	}
}

// Login
loginButton.onclick = async () => {
	const username = loginUsernameInput.value;
	const password = loginPasswordInput.value;

	try {
		const result = await loginUser(username, password);
		console.log("Success: Logged in", { user: username, response: result });
		updateMessagesDisplay();
	} catch (error) {
		console.error("Login Error:", error.message);
	}
};

// Signup
signupButton.onclick = async () => {
	const username = signupUsernameInput.value;
	const password = signupPasswordInput.value;

	try {
		const result = await signUpUser(username, password);
		console.log("Success: Account created", {
			user: username,
			response: result,
		});
		updateMessagesDisplay();
	} catch (error) {
		console.error("Signup Error:", error.message);
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
clearFileButton.onclick = () => {
	messageFileInput.value = "";
	messageDataTextarea.value = "";
	messageFileInput.onchange();
};

// Send Message
sendButton.onclick = async () => {
	const senderId = messageSenderIdInput.value;
	const groupId = messageGroupIdInput.value;
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
			senderId,
			groupId || null,
			messageType,
			payloadData,
		);
		console.log("Success: Message sent", { response: result });
		updateMessagesDisplay();

		if (file) {
			clearFileButton.onclick();
		}
	} catch (error) {
		console.error("Send Error:", error.message);
	}
};

// Initialization
updateMessagesDisplay();
startLeftOverMessagesPolling();
