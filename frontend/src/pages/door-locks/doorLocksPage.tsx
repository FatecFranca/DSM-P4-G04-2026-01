import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import axios from "axios";

export default function DoorLockPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isLoading, isLoggedIn } = useAuth();

    const [status, setStatus] = useState<"on" | "off">("off");
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!id) return;

        const fetchLockStatus = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/door-locks/${id}`);
                setStatus(response.data.status);
            } catch (err) {
                console.error('Erro ao buscar status da fechadura:', err);
            }
        };

        fetchLockStatus();
    }, [id]);

    useEffect(() => {
        if (!isLoggedIn || !user || isLoading) return;

        const access = user.doorLockUsers.some(
            (dl) => Number(dl.doorLockId) === Number(id) && dl.status === "active"
        );

        if (!access) {
            setHasAccess(false);
            setTimeout(() => navigate("/"), 3000);
        } else {
            setHasAccess(true);
        }
    }, [user, id, isLoading, isLoggedIn, navigate]);

    useEffect(() => {
        if (!socket || !isConnected || !hasAccess || !id) return;

        socket.emit('join-lock', { lockId: Number(id) });

        const handleUpdate = (data: any) => {
            if (data.id === Number(id) && data.status) {
                setStatus(data.status);
            }
        };

        socket.on('door-lock-updated', handleUpdate);

        return () => {
            socket.emit('leave-lock', { lockId: Number(id) });
            socket.off('door-lock-updated', handleUpdate);
        };
    }, [socket, isConnected, hasAccess, id]);

    const toggleStatus = () => {
        if (!socket || !isConnected) {
            console.warn("Socket não conectado");
            return;
        }

        const newStatus = status === "on" ? "off" : "on";

        socket.emit('toggle-lock', {
            lockId: Number(id),
            status: newStatus
        });

        setStatus(newStatus);
    };

    if (isLoading || hasAccess === null) {
        return (
            <div className="app-shell flex min-h-screen items-center justify-center">
                <div className="surface-card rounded-2xl px-8 py-6 font-semibold text-[var(--primary-darker)]">Carregando...</div>
            </div>
        );
    }

    if (hasAccess === false) {
        return (
            <div className="app-shell flex min-h-screen items-center justify-center p-4">
                <div className="surface-card max-w-md rounded-2xl p-8 text-center">
                    <h1 className="mb-2 text-xl font-bold text-red-600">Acesso negado</h1>
                    <p className="text-[var(--muted-text)]">Você não tem permissão para acessar esta fechadura.</p>
                    <p className="mt-2 text-sm text-[var(--muted-text)]">Redirecionando para a página inicial...</p>
                </div>
            </div>
        );
    }

    const isOpen = status === "on";

    return (
        <div className="app-shell min-h-screen px-4 py-8 md:px-10">
            <div className="mx-auto flex max-w-4xl flex-col gap-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex w-fit items-center gap-2 rounded-xl border border-[var(--border-color)] bg-white px-4 py-2 font-semibold text-[var(--primary)] transition hover:bg-[var(--accent-light)]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Voltar
                </button>

                <section className="surface-card rounded-[2rem] p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-[var(--primary-darker)]">
                                Fechadura #{id}
                            </span>
                            <h1 className="mt-4 text-3xl font-bold text-[var(--text-color)] md:text-4xl">Controle da porta</h1>
                            <p className="mt-3 max-w-xl text-[var(--muted-text)]">
                                Altere o status da fechadura e acompanhe a conexão em tempo real.
                            </p>
                        </div>

                        <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${isConnected ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {isConnected ? "Conectado" : "Desconectado"}
                        </div>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        <div className="rounded-2xl bg-[var(--accent-light)] p-6">
                            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">Status da porta</p>
                            <p className="mt-3 text-4xl font-bold text-[var(--text-color)]">{status.toUpperCase()}</p>
                            <p className="mt-2 text-sm text-[var(--muted-text)]">{isOpen ? "Porta aberta" : "Porta trancada"}</p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border-color)] bg-white p-6">
                            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">Ação rápida</p>
                            <button
                                onClick={toggleStatus}
                                className={`mt-4 w-full rounded-xl px-5 py-3 font-semibold text-white transition ${isOpen ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
                            >
                                Alternar para {isOpen ? "OFF" : "ON"}
                            </button>
                            <p className="mt-4 text-sm leading-6 text-[var(--muted-text)]">
                                O status atualiza em tempo real quando alterado por outro dispositivo.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
