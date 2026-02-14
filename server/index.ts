import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
console.log('Server started on "ws://localhost:8080"');

setInterval(() => {
	const mockPrice = (65000 + Math.random() * 500).toFixed(2);

	const ticketUpdate = JSON.stringify({
		user: 'System',
		text: `BTC Price: ${mockPrice}`,
		timeStamp: new Date().toLocaleTimeString(),
	});

	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(ticketUpdate);
		}
	});
}, 10000);

wss.on('connection', (socket) => {
	console.log('A user connected!');

	socket.on('message', (message) => {
		try {
			const parsedMessage = JSON.parse(message.toString());
			console.log('Message received: ', parsedMessage);

			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(
						JSON.stringify({
							senderId: parsedMessage.senderId,
							text: parsedMessage.text,
							timeStamp: new Date().toLocaleTimeString(),
							isSystem: false,
						})
					);
				}
			});
		} catch (error) {
			console.error('Received non-JSON message: ', message.toString());
		}
	});

	socket.on('close', () => {
		console.log('A user disconnected!');
	});
});
