import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import elockText from '/images/elock-texto.png'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Modal from '@mui/material/Modal';
import Divider from '@mui/material/Divider';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    setLoginModalOpen: (open: boolean) => void;
    itemSelected?: string;
    setItemSelected?: (item: string) => void;
}

export default function Header({ setLoginModalOpen, itemSelected, setItemSelected }: HeaderProps) {
    const navigate = useNavigate();
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const { user, isLoggedIn, logout } = useAuth();

    const menuItems = [
        {
            name: 'Home',
        },
        {
            name: 'Fechaduras',
        },
        {
            name: 'Dashboard',
        }
    ]

    const handleMenuClick = (itemName: string) => {
        setItemSelected?.(itemName);
        if (itemName === 'Dashboard') {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="surface-card fixed left-4 right-4 top-4 z-40 flex items-center justify-between rounded-2xl px-5 py-4 font-semibold md:left-10 md:right-10 md:px-10" >
            <img
                src={elockText}
                alt="trancaai-logo"
                width={150}
                onClick={() => { navigate('/') }}
                className="cursor-pointer"
            />

            <div className="hidden items-center gap-3 rounded-full bg-[var(--accent-light)] px-3 py-2 text-sm text-slate-700 md:flex">
                {menuItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3" onClick={() => handleMenuClick(item.name)}>
                        <div className="flex flex-col items-center">
                            <p className={`cursor-pointer rounded-full px-4 py-2 transition-colors ${itemSelected === item.name
                                ? 'bg-[var(--primary)] text-white shadow-sm shadow-blue-500/20'
                                : 'hover:bg-white hover:text-[var(--primary)]'
                                }`}>{item.name}</p>
                            {itemSelected === item.name && (
                                <div className="mt-1 h-1 w-1 rounded-full bg-[var(--primary-light)]" />
                            )}
                        </div>

                        {index !== menuItems.length - 1 && <Divider orientation="vertical" flexItem />}
                    </div>
                ))}
            </div>

            {isLoggedIn && user ? (
                <div className="flex items-center gap-3">
                    <div
                        className="flex cursor-pointer items-center gap-1 rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[var(--primary-darker)] transition-colors hover:bg-[var(--accent-hover)] md:text-base"
                    >
                        <p>Olá, <span className="font-bold">{user.name.split(" ")[0]}</span></p>
                    </div>
                    <button
                        onClick={() => setLogoutModalOpen(true)}
                        className='cursor-pointer rounded-full p-2 text-slate-500 transition-colors duration-300 hover:bg-red-50 hover:text-red-700'
                    >
                        <ExitToAppIcon />
                    </button>
                    <Modal
                        open={logoutModalOpen}
                        onClose={() => setLogoutModalOpen(false)}
                        className="flex items-center justify-center"
                    >
                        <div className="surface-card flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl p-8 text-center">
                            <h2 className="text-xl font-semibold">Tem certeza que deseja sair da conta?</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        logout();
                                        setLogoutModalOpen(false);
                                    }}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors cursor-pointer"
                                >
                                    Sim, sair
                                </button>
                                <button
                                    onClick={() => setLogoutModalOpen(false)}
                                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            ) : (
                <button
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2 text-sm text-white shadow-sm shadow-blue-500/30 transition-colors hover:bg-[var(--primary-dark)] md:text-base"
                    onClick={() => setLoginModalOpen(true)}
                >
                    <PersonOutlineOutlinedIcon />
                    <p>Criar conta</p>
                </button>
            )}
        </div>
    )
}
