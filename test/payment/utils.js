async function dispatch(res) {
	if (res.ok) return res.json();
	const err = await res.json();
	addMessage(err.msg);
}

// Helper for displaying status messages.
const addMessage = (msg) => {
	console.log(`Debug: ${msg}`);
	document.getElementById('messages').innerHTML += `> ${msg}<br>`;
};
