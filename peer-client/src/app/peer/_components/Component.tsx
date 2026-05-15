'use client'

import { Message } from "@/types/Message";
import Peer, { DataConnection } from "peerjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";


export default function Component() {
    const [clickCopy, setClickCopy] = useState(false);
    const [clientId, setClientId] = useState<string>('');
    const [connectorId, setConnectorId] = useState<string>('');
    const [connect, setConnect] = useState<DataConnection | null>(null);
    const [peer, setPeer] = useState<Peer | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    function generateRandomID() {
        return Math.random().toString(36).substring(2, 8);
    };

    useEffect(() => {
        audioRef.current = new Audio("/audio/pop.mp3");

        const id: string = generateRandomID();
        const peer: Peer = new Peer(id); // register peer ID

        // Connection established on the peer server
        peer.on("open", function () {
            peer.on("connection", function (conn) {
                console.log(`${conn.peer} connected to you.`);
                setConnect(conn);
                // Wait for incoming data from the other side
                conn.on("data", function (data) {
                    setMessages(prev => [...prev, { message: String(data), sender: "other" }])
                    audioRef?.current?.play();
                });
            });
        });

        setClientId(id);
        setPeer(peer);

        return () => {
            peer.destroy();
        }
    }, []) // We will use the empty array so that it will only run once

    async function handleClickCopy() {
        if (!clientId) return;
        await navigator.clipboard.writeText(clientId);
        setClickCopy(true);
        setTimeout(() => {
            setClickCopy(false);
        }, 2000);
    }

    function handleConnect() {
        if (!peer || !connectorId) return;

        const conn = peer.connect(connectorId);

        conn.on("open", () => {
            setConnect(conn);
            console.log(`Successfully connected to ${connectorId}.`);
        });

        conn.on("data", (data) => {
            setMessages(prev => [...prev, { message: String(data), sender: "other" }])
            audioRef?.current?.play();
        });
    }

    function sendMessage() {
        connect?.send(messageInput);
        setMessages(prev => [...prev, { message: String(messageInput), sender: 'me' }]);
        setMessageInput('');
    }

    return (
        <div className="w-[400px] mx-auto flex flex-col">
            <div>
                <div className="w-[400px] rounded-[15px] flex flex-col gap-3 border-1 border-gray-100 px-4 py-2">
                    <div className="flex justify-end">
                        <button
                            className="px-2 py-2 bg-gray-100 rounded-[5px] hover:cursor-pointer hover:bg-gray-50"
                            onClick={handleClickCopy}>
                            {clickCopy ? <FaCheck className="text-green-800" /> : <FaCopy />}
                        </button>
                    </div>

                    <p className="text-2xl font-mono text-center">
                        Your Client ID: {clientId}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <input type="text" className="w-[150px] mx-auto border-1 rounded-[5px] px-2" onChange={(e) => setConnectorId(e.target.value)} />
                    <button
                        className="w-[100px] rounded text-sm mx-auto bg-gray-50 border"
                        onClick={handleConnect}>
                        Connect
                    </button>

                    <div className="flex gap-1">
                        <input type="text" className="w-[150px] mx-auto border-1 rounded-[5px] px-2" value={messageInput} onChange={(e) => {
                            setMessageInput(e.target.value);
                        }} />
                        <button onClick={sendMessage} className="w-[100px] rounded text-sm mx-auto bg-gray-50 border">Send Message</button>
                    </div>
                </div>

                <div>
                    {messages.map((msg, id) => (
                        <div key={id}>
                            <div className="flex gap-3">
                                <p className={`${msg.sender === 'me' ? 'text-blue-300' : 'text-black'}`}>{msg.sender}</p>
                                <p>{msg.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}