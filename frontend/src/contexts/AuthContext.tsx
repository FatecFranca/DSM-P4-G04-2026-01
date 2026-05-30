import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";

interface DoorLock {
    id: number;
    name: string;
    localization: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface DoorLockUser {
    id: number;
    userId: number;
    doorLockId: number;
    paper: string;
    status: string;
    sharedBy: number | null;
    startsAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
    doorLock: DoorLock;
    sharedByUser: User | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    doorLockUsers: DoorLockUser[];
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    token: string | null;
    refreshUserData: () => Promise<void>;
    fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    axios.defaults.withCredentials = true;

    // Salva o token no localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/profile`, { withCredentials: true });
            const id = response.data.id;
            setUserId(id);
            return id;
        } catch (err) {
            setUserId(0);
            console.log(err);
            return null;
        }
    };

    const fetchUserData = async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`);
            setUser(response.data);
            setIsLoggedIn(true);
            console.log('user logado:', response.data)
        } catch (err) {
            setUser(null);
            setIsLoggedIn(false);
            console.log(err)
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            setIsLoading(true);
            try {
                await fetchUser();
            } catch {
                setUser(null);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password }, { withCredentials: true });
            console.log('[AuthContext] Login response:', response.data);
            const token = response.data.access_token; // Backend retorna 'access_token', não 'token'
            console.log('[AuthContext] Token extraído:', token);
            setToken(token);
            await fetchUser();
            await fetchUserData();
        } catch (err) {
            setUser(null);
            setIsLoggedIn(false);
            throw err;
        }
    };


    const logout = () => {
        setUser(null);
        setUserId(null);
        setToken(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, token, refreshUserData: fetchUserData, fetchUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    return context;
};
