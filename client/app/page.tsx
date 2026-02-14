'use client';

import { useEffect, useState, useRef } from 'react';

export default function Home() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [messages, setMessages] = useState<any[]>([]);
	const [input, setInput] = useState('');
	const [isConnected, setIsConnected] = useState(false);

	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const socket = new WebSocket('ws://localhost:8080');
		socketRef.current = socket;

		socket.onopen = () => {
			console.log('Connected to a server.');
			setIsConnected(true);
		};

		socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			setMessages((prev) => [...prev, data]);
		};

		socket.onclose = () => {
			console.log('Disconnected!');
			setIsConnected(false);
		};

		return () => socket.close();
	}, []);

	const sendMessage = () => {
		if (socketRef.current && input.trim()) {
			socketRef.current.send(input);
			setInput('');
		}
	};

	return (
		<main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
			<div className="w-full max-w-md border border-gray-700 rounded-lg overflow-hidden shadow-xl bg-gray-800">
				{/* Header */}
				<div className="bg-gray-700 p-4 flex justify-between items-center">
					<h1 className="font-bold text-lg">Global Chat Room</h1>
					<div className="flex items-center gap-2 text-sm">
						Status:
						<span
							className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
						></span>
					</div>
				</div>

				{/* Chat Box (Scrollable) */}
				<div className="h-96 overflow-y-auto p-4 space-y-2 flex flex-col">
					{messages.map((msg, index) => (
						<div key={index} className="bg-gray-700 p-2 rounded-lg self-start max-w-[80%]">
							<span className="text-xs text-gray-400 block">
								{msg.user} • {msg.timestamp}
							</span>
							<p>{msg.text}</p>
						</div>
					))}
					{messages.length === 0 && (
						<p className="text-gray-500 text-center mt-10">No messages yet...</p>
					)}
				</div>

				{/* Input Area */}
				<div className="p-4 border-t border-gray-700 flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
						className="flex-1 bg-gray-900 text-white rounded p-2 border border-gray-600 focus:outline-none focus:border-blue-500"
						placeholder="Type a message..."
					/>
					<button
						onClick={sendMessage}
						disabled={!isConnected}
						className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Send
					</button>
				</div>
			</div>
		</main>
	);
}
