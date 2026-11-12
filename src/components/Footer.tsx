"use client";

export default function Footer() {
  return (
    <footer className="bg-forest px-6 py-10 text-paper md:px-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-xs tracking-[0.25em] uppercase md:flex-row">
        <p className="font-display text-2xl tracking-normal normal-case italic">
          elioo
        </p>
        <p className="text-sage">© {new Date().getFullYear()} Bilal Ait Sai</p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-full border border-paper/30 px-5 py-2 transition-colors duration-500 hover:bg-paper hover:text-forest"
        >
          Retour en haut ↑
        </button>
      </div>
    </footer>
  );
}
