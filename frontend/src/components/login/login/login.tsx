import { useState } from "react";
import axios from "axios";
import Modal from "@mui/material/Modal";
import elockText from "/images/elock-texto.png";
import WelcomeSVG from "/svgs/welcome.svg";
import LoginSVG from "/svgs/signin.svg";
import { useAuth } from "../../../contexts/AuthContext";

interface LoginModalProps {
  open: boolean;
  handleClose: () => void;
}

export default function LoginModal({ open, handleClose }: LoginModalProps) {
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoginInterface, setIsLoginInterface] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);

      handleClose();
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        `${API_URL}/users`,
        { name, email, password },
        { withCredentials: true }
      );
      await login(email, password);
      handleClose();
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar. Verifique os dados informados.");
    }
  };

  const inputClass = "rounded-xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary-light)] focus:ring-4 focus:ring-blue-100";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex min-h-screen items-center justify-center p-4"
    >
      <div className="surface-card grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white md:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
          <img
            src={elockText}
            alt="trancaai text logo"
            width={110}
          />

          {isLoginInterface ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-color)] md:text-4xl">
                  Olá, bem-vindo de volta
                </h1>
                <p className="mt-3 text-sm text-[var(--muted-text)]">
                  Acesse sua conta para continuar gerenciando sua segurança.
                </p>
              </div>
              <input
                type="email"
                placeholder="Digite o email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
              <button
                type="submit"
                className="mt-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[var(--primary-dark)]"
              >
                Entrar
              </button>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </form>
          ) : (
            <form
              onSubmit={handleSignUp}
              className="flex flex-col gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-color)] md:text-4xl">
                  Crie sua conta TrancAi
                </h1>
                <p className="mt-3 text-sm text-[var(--muted-text)]">
                  Dê o próximo passo para controlar suas fechaduras conectadas.
                </p>
              </div>
              <input
                type="text"
                placeholder="Digite o seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="email"
                placeholder="Digite o email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
              <button
                type="submit"
                className="mt-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[var(--primary-dark)]"
              >
                Cadastrar
              </button>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </form>
          )}

          <p className="text-sm text-[var(--muted-text)]">
            {isLoginInterface ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <span
              className="cursor-pointer font-semibold text-[var(--primary)] underline"
              onClick={() => setIsLoginInterface(!isLoginInterface)}
            >
              {isLoginInterface ? "Cadastrar" : "Entrar"}
            </span>
          </p>
        </div>

        <div className="hidden items-center justify-center bg-[var(--accent-light)] p-8 md:flex">
          <img
            src={isLoginInterface ? LoginSVG : WelcomeSVG}
            alt={isLoginInterface ? "Login Illustration" : "Welcome Illustration"}
            className="max-h-[30rem] w-full object-contain"
          />
        </div>
      </div>
    </Modal>
  );
}
