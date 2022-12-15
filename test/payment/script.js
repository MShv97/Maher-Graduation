let accessToken, stripe, cardElement, clientSecret;

async function login() {
	const phone = document.getElementById('phone').value;
	const password = document.getElementById('password').value;
	if (!phone || !password) return addMessage('Please log in first.');

	const { data } = await fetch('/api/auth/otp', {
		body: JSON.stringify({ phone, password }),
		method: 'POST',
		headers: { 'content-type': 'application/json' },
	}).then(dispatch);
	if (!data) return;

	accessToken = data.accessToken;
	document.getElementById('CurrentUser').innerHTML = `Current user: ${phone}`;
}

async function initPayment() {
	if (!accessToken) return addMessage('Please log in first.');

	const paymentId = document.getElementById('paymentId').value;
	if (!paymentId) return addMessage('Please enter payment id first.');

	const { data: paymentParams } = await fetch('/api/payment/metadata').then(dispatch);
	if (!paymentParams?.stripe?.publishableKey) return addMessage('No publishable key returned from the server.');

	const { data: payment } = await fetch('/api/payment/' + paymentId, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + accessToken },
	}).then(dispatch);
	if (!payment) return;
	addMessage('payment.intent = ' + payment.stripe.intent);
	if (payment.stripe.account) addMessage('payment.account = ' + payment.stripe.account);
	clientSecret = payment.stripe.client_secret;
	stripe = Stripe(paymentParams.stripe.publishableKey, {
		stripeAccount: payment.stripe.account,
	});
	cardElement = stripe.elements().create('card');
	document.getElementById('payment-form').style.display = 'none';
	document.getElementById('card-form').style.display = 'block';
	cardElement.mount('#card-element');
}

async function pay() {
	const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
		payment_method: { card: cardElement },
	});
	if (stripeError) return addMessage(stripeError.code);
	addMessage(`Success`);
}
