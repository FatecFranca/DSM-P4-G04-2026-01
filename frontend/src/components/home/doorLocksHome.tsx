import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import DoorLocksCard from "./doorLocksCard";
import axios from "axios";

export default function DoorLocksHome() {
    const { user, fetchUserData } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [newLockName, setNewLockName] = useState("");
    const [newLockLocation, setNewLockLocation] = useState("");

    const ownerLocks = user?.doorLockUsers?.filter(dl => dl.paper === "owner") || [];
    const sharedLocks = user?.doorLockUsers?.filter(dl => dl.paper !== "owner") || [];

    const handleCreateLock = async () => {
        if (!newLockName.trim() || !newLockLocation.trim()) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/door-locks`, {
                name: newLockName,
                localization: newLockLocation,
                status: "off"
            });

            if (fetchUserData) await fetchUserData();

            setNewLockName("");
            setNewLockLocation("");
            setIsCreating(false);
            alert("Fechadura criada com sucesso!");
        } catch (err) {
            console.error("Erro ao criar fechadura:", err);
            alert("Erro ao criar fechadura!");
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10">
            <div className="flex flex-col gap-5">
                <div className="surface-card flex w-full flex-col gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">Controle de acesso</span>
                        <h3 className="mt-1 text-3xl font-bold text-[var(--text-color)]">Suas Fechaduras</h3>
                        <p className="mt-2 text-sm text-[var(--muted-text)]">Gerencie as fechaduras que pertencem à sua conta.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex w-fit items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[var(--primary-dark)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Criar Fechadura
                    </button>
                </div>

                {ownerLocks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {ownerLocks.map((access) => (
                            <DoorLocksCard key={access.id} access={access} onDelete={fetchUserData} />
                        ))}
                    </div>
                ) : (
                    <p className="surface-card rounded-2xl p-6 text-sm text-[var(--muted-text)]">Você não possui nenhuma fechadura.</p>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <div>
                    <span className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">Compartilhamentos</span>
                    <h3 className="mt-1 text-3xl font-bold text-[var(--text-color)]">Fechaduras Compartilhadas</h3>
                </div>
                {sharedLocks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {sharedLocks.map((access) => (
                            <DoorLocksCard key={access.id} access={access} />
                        ))}
                    </div>
                ) : (
                    <p className="surface-card rounded-2xl p-6 text-sm text-[var(--muted-text)]">Nenhuma fechadura foi compartilhada com você.</p>
                )}
            </div>

            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="surface-card w-full max-w-md rounded-2xl p-6">
                        <h2 className="mb-1 text-2xl font-bold text-[var(--text-color)]">Criar Nova Fechadura</h2>
                        <p className="mb-5 text-sm text-[var(--muted-text)]">Cadastre o nome e a localização do dispositivo.</p>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Nome</label>
                                <input
                                    type="text"
                                    value={newLockName}
                                    onChange={(e) => setNewLockName(e.target.value)}
                                    className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 outline-none transition focus:border-[var(--primary-light)] focus:ring-4 focus:ring-blue-100"
                                    placeholder="Ex: Porta Principal"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Localização</label>
                                <input
                                    type="text"
                                    value={newLockLocation}
                                    onChange={(e) => setNewLockLocation(e.target.value)}
                                    className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 outline-none transition focus:border-[var(--primary-light)] focus:ring-4 focus:ring-blue-100"
                                    placeholder="Ex: Entrada da Casa"
                                />
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="rounded-xl border border-[var(--border-color)] px-4 py-2 font-semibold text-slate-700 transition hover:bg-[var(--accent-light)]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreateLock}
                                    className="rounded-xl bg-[var(--primary)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--primary-dark)]"
                                >
                                    Criar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
