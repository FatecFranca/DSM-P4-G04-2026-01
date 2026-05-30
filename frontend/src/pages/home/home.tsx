import { useState } from "react";
import Header from "../../components/global/header";
import LoginModal from "../../components/login/login/login";
import DoorLocksHome from "../../components/home/doorLocksHome";
import remote from "/svgs/remote.svg";
import iotconnect from "/svgs/iotconnect.svg";
import everywhere from "/svgs/everywhere.svg";
import elock from "/images/elock.png";

export default function HomePage() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [itemSelected, setItemSelected] = useState("Home");

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
  };

  const features = [
    {
      title: "Controle remoto",
      description: "Tranque e destranque suas portas pelo app ou site com uma interface direta e segura.",
      image: everywhere,
      alt: "Controle remoto",
    },
    {
      title: "Conectividade IoT",
      description: "Acompanhe suas fechaduras em tempo real com comunicação estável e criptografada.",
      image: iotconnect,
      alt: "Conectividade IoT",
    },
    {
      title: "Segurança avançada",
      description: "Gerencie permissões, monitore acessos e mantenha o controle de cada ambiente.",
      image: remote,
      alt: "Segurança",
    },
  ];

  return (
    <div className="app-shell flex min-h-screen w-full flex-col">
      <Header
        setLoginModalOpen={setLoginModalOpen}
        itemSelected={itemSelected}
        setItemSelected={setItemSelected}
      />
      <LoginModal open={isLoginModalOpen} handleClose={handleLoginSuccess} />

      <main className="flex w-full px-4 pb-10 pt-32 md:px-10">
        {itemSelected === "Home" && (
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-16">
            <section className="grid min-h-[58vh] items-center gap-10 rounded-[2rem] bg-white/70 p-6 shadow-[0_25px_70px_rgba(15,35,89,0.08)] ring-1 ring-[var(--border-color)] md:grid-cols-[1.2fr_0.8fr] md:p-12">
              <div className="flex flex-col items-start text-left">
                <span className="mb-5 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--primary-darker)]">
                  Segurança inteligente para portas conectadas
                </span>
                <h1 className="max-w-3xl text-4xl font-bold leading-tight text-[var(--text-color)] md:text-6xl">
                  TrancAi no controle da sua segurança
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-text)] md:text-lg">
                  Controle fechaduras inteligentes, acompanhe acessos em tempo real e organize permissões em uma experiência azul, limpa e fácil de usar.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => setItemSelected("Fechaduras")}
                    className="rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[var(--primary-dark)]"
                  >
                    Ver fechaduras
                  </button>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="rounded-xl border border-[var(--border-color)] bg-white px-6 py-3 font-semibold text-[var(--primary-darker)] transition hover:border-[var(--primary-light)] hover:text-[var(--primary)]"
                  >
                    Entrar na plataforma
                  </button>
                </div>
              </div>

              <div className="flex justify-center md:justify-end">
                <div className="relative flex aspect-square w-64 items-center justify-center rounded-[2rem] bg-[var(--accent-light)] ring-1 ring-[var(--border-color)] md:w-80">
                  <img src={elock} width="180" alt="TrancAi" className="relative z-10 drop-shadow-xl" />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="surface-card flex min-h-72 flex-col rounded-2xl p-6">
                  <div className="mb-5 flex h-36 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                    <img src={feature.image} alt={feature.alt} className="h-32 w-40 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--primary-darker)]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-text)]">{feature.description}</p>
                </article>
              ))}
            </section>

            <section className="grid items-center gap-6 rounded-[1.75rem] bg-[var(--primary-darker)] p-8 text-white md:grid-cols-[1fr_auto] md:p-10">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  Transforme sua casa em um ambiente inteligente com a TrancAi
                </h2>
                <p className="mt-3 text-blue-100">
                  Cadastre-se e comece a conectar suas fechaduras agora mesmo.
                </p>
              </div>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="w-fit rounded-xl bg-white px-6 py-3 font-semibold text-[var(--primary)] transition hover:bg-[var(--accent-light)]"
              >
                Criar conta
              </button>
            </section>

            <footer className="border-t border-[var(--border-color)] py-6 text-sm text-[var(--muted-text)]">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--primary)]">TrancAi</span>
                  <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
                </div>

                <div className="flex items-center gap-6">
                  <a href="#sobre" className="transition hover:text-[var(--primary)]">Sobre</a>
                  <a href="#contato" className="transition hover:text-[var(--primary)]">Contato</a>
                  <a href="#privacidade" className="transition hover:text-[var(--primary)]">Privacidade</a>
                </div>
              </div>
            </footer>
          </div>
        )}

        {itemSelected === "Fechaduras" && <DoorLocksHome />}
      </main>
    </div>
  );
}
