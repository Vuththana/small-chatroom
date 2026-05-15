import { Message } from "@/types/Message";
import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";

export function Component() {
    const [clientId, setClientId] = useState<string>('');
    const [peer, setPeer] = useState<Peer | null>(null);
    const [connectorId, setConnectorId] = useState<string>('');
    const [connect, setConnect] = useState<DataConnection | null>(null);
    const [message, setMessage] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>();

    // Generate random ID for each client
    function generateRandomID() {
        return Math.random().toString(36).substring(2, 8);
    }

    // We will use the useEffect() to generate a random ID for our client
    useEffect(() => {
        const id: string = generateRandomID();
        const peerInstance: Peer = new Peer(id); // This will register the client ID to the PeerServer

        /*
            We will store the state so it will keep session in track
        */
        setClientId(id);
        setPeer(peerInstance);

        return () => {
            peerInstance.destroy();
        }
    }, []); // We will the array dependency so that it will only run once (page loaded)

    function handleConnect() {
        if(!peer || !connectorId) return;

        const conn = peer?.connect(connectorId)

        conn?.on("open", () => {
            console.log(`Successfully connected to: ${connectorId}`)
            setConnect(conn);
        });

        conn?.on("data", (data) => {
            setMessage(prev => [...prev, { message: String(data), sender: "other" }])
        });
    }

    function sendMessage() {
        connect?.send(messageInput);
        setMessage(prev => [...prev, {message: String(messageInput), sender: "me"}]);
        setMessageInput(''); // Clear input
    }

    return (
        <div>
            Client ID: {clientId}
        </div>
    )
}