import FmdGoodIcon from '@mui/icons-material/FmdGood';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyIcon from '@mui/icons-material/Key';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface DoorLocksCardProps {
    access: {
        id: number;
        paper: string;
        status: string;
        startsAt: string | null;
        expiresAt: string | null;
        doorLock: {
            id: number;
            name: string;
            localization: string;
            status: string;
        };
        sharedByUser?: {
            name: string;
        } | null;
    };
    onDelete?: () => Promise<void>;
}

export default function DoorLocksCard({ access, onDelete }: DoorLocksCardProps) {
    const isActive = access.doorLock.status === 'ON';
    const statusColor = isActive ? 'bg-emerald-500' : 'bg-slate-500';

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Tem certeza que deseja excluir a fechadura "${access.doorLock.name}"?`)) {
            return;
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/door-locks/${access.doorLock.id}`);
            alert("Fechadura excluída com sucesso!");
            if (onDelete) await onDelete();
        } catch (err) {
            console.error("Erro ao excluir fechadura:", err);
            alert("Erro ao excluir fechadura!");
        }
    };

    return (
        <Link to={`/door-locks/${access.doorLock.id}`} className="block">
            <div className="surface-card relative min-h-56 cursor-pointer rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,35,89,0.14)]">
                <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white ${statusColor}`}>
                    {access.doorLock.status}
                </span>

                <span
                    className={`absolute -left-3 -top-3 rounded-xl p-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20
                    ${access.paper === 'owner' ? 'bg-[var(--primary)]'
                            : access.paper === 'admin' ? 'bg-[var(--primary-dark)]'
                                : 'bg-amber-500'}`}
                >
                    {access.paper === 'owner' ? <LocalPoliceIcon fontSize='small' />
                        : access.paper === 'admin' ? <AdminPanelSettingsIcon fontSize='small' />
                            : <KeyIcon fontSize='small' />}
                </span>

                {access.paper === 'owner' && onDelete && (
                    <button
                        onClick={handleDelete}
                        className="absolute left-4 top-4 rounded-full bg-red-500 p-1.5 text-white transition hover:bg-red-600"
                        title="Excluir fechadura"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}

                <div className="mb-3 mt-6 flex items-center gap-2 text-[var(--primary)]">
                    <FmdGoodIcon fontSize="small" />
                    <span className="text-sm font-semibold">{access.doorLock.localization}</span>
                </div>

                <h2 className="mb-4 text-xl font-bold text-[var(--text-color)]">
                    {access.doorLock.name}
                </h2>

                <div className="space-y-2 text-sm text-[var(--muted-text)]">
                    <p><strong className="text-slate-700">Status do acesso:</strong> {isActive ? 'Aberta' : 'Trancada'}</p>
                    {access.startsAt && (
                        <p><strong className="text-slate-700">Início:</strong> {new Date(access.startsAt).toLocaleString()}</p>
                    )}
                    {access.expiresAt && (
                        <p><strong className="text-slate-700">Expira em:</strong> {new Date(access.expiresAt).toLocaleString()}</p>
                    )}
                    {access.sharedByUser && (
                        <p className='truncate'><strong className="text-slate-700">Compartilhado por:</strong> {access.sharedByUser.name}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}
