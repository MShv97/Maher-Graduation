let accessToken;

async function dispatch(res) {
	if (res.ok) return res.json();
	const err = await res.json();
	alert(err.message || err.msg);
}

function clear() {
	document.getElementById('data').innerHTML = '';
	document.getElementById('current-socket').innerHTML = 'PLEASE CHOOSE A SOCKET!';
	document.getElementById(`byIdInput`).value = '';
	// document.getElementById(`query`).value = '';
}

function connect(path, type) {
	const accessToken = document.getElementById('accessToken').value;
	if (!accessToken) alert('Please enter access token first.');
	if (window.socket && window.socket.id) window.socket.disconnect();

	let url;
	if (type) {
		const id = document.getElementById(`byIdInput`).value;
		if (!id) {
			alert(`Please enter ${path} id`);
			return;
		}
		url = `/${path}/${id}`;
	} else {
		// const query = document.getElementById('${path}-query').value;
		// url = query ? `/${path}?${query}` : `/${path}`;
		url = `/${path}`;
	}
	console.log(url);

	const socket = io(url, {
		transports: ['websocket', 'polling'],
		auth: { accessToken },
		// query: { color: 'White' },
	});

	window.socket = socket;
	socket.on('connect_error', function (err) {
		document.getElementById('current-socket').innerHTML = 'FAILED';
		console.log(err);
	});

	socket.on('connect', function () {
		document.getElementById('data').innerHTML = '';
		document.getElementById('current-socket').innerHTML = url;
		console.log('Socket connected.');
	});

	socket.onAny(function (...data) {
		div = document.getElementById('data');
		div.insertAdjacentHTML('beforeEnd', JSON.stringify(data, null, 4));
		div.insertAdjacentHTML('beforeEnd', '<br/><br/>');
	});
}
