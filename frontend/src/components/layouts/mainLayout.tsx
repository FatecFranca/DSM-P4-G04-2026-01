import { useState } from "react";
import Header from "../global/header";
import LoginModal from "../login/login/login";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    const handleLoginSuccess = () => {
        setLoginModalOpen(false);
    };

    return (
        <div className="app-shell flex min-h-screen min-w-screen flex-1 flex-col relative">
            <Header setLoginModalOpen={setLoginModalOpen} />
            <LoginModal open={isLoginModalOpen} handleClose={handleLoginSuccess} />
            <div className="flex px-4 pb-8 pt-32">
                {children}
            </div>
        </div>
    );
}
