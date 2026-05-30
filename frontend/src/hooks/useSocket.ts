import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export const useSocket = () => {
    const { token } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log('[useSocket] Token:', token ? 'Presente' : 'Ausente');

        if (!token) {
            console.warn('[useSocket] Sem token, não conectando');
            return;
        }

        const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        console.log('[useSocket] Conectando em:', url);

        const socket = io(url, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[useSocket] ✅ WebSocket conectado:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('[useSocket] ❌ WebSocket desconectado');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('[useSocket] ❌ Erro de conexão:', err.message);
            setIsConnected(false);
        });

        return () => {
            console.log('[useSocket] Limpando conexão');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token]);

    console.log('[useSocket] Estado atual - Socket:', socketRef.current ? 'Existe' : 'Null', 'Conectado:', isConnected);

    return { socket: socketRef.current, isConnected };
};
