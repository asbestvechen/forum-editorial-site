import { Menu, X } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { brand } from "@/lib/brand";
import { scrollToElement } from "@/lib/scroll";

type SiteHeaderProps = {
  dark?: boolean;
};

const links = [
  { href: "#directions", label: "Направления" },
  { href: "#about", label: "О нас" },
  { href: "#/team", label: "Наша команда" },
  { href: "#/events", label: "События" },
  { href: "#contacts", label: "Контакты" },
];

function CoinWordmark() {
  return (
    <span className="coin-wordmark" aria-label="ФОРУМ / 4ROOM">
      <span className="coin-wordmark__face coin-wordmark__face--front">ФОРУМ</span>
      <span className="coin-wordmark__face coin-wordmark__face--back">4ROOM</span>
    </span>
  );
}

export function SiteHeader({ dark = false }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const surface = dark
    ? "bg-[#241D14]/95 text-[#FBF8F3] border-[#FBF8F3]/10"
    : "bg-[#FBF8F3]/95 text-[#241D14] border-[#241D14]/10";
  const muted = dark ? "text-[#FBF8F3]/65" : "text-[#241D14]/65";

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#") || href.startsWith("#/")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    window.history.pushState({}, "", href);
    scrollToElement(target);
  };

  return (
    <header className={`site-header sticky top-0 z-40 border-b backdrop-blur-xl ${surface}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 h-[76px] flex items-center justify-between">
        <a href="#/" className="flex items-center gap-3 group" aria-label="ФОРУМ — на главную">
          <span className="relative flex flex-col items-center leading-none">
            <img
              src="./logo/icon-gold-transparent.png"
              alt=""
              width="34"
              height="34"
              className="h-8 w-8 md:h-9 md:w-9 object-contain transition-transform duration-500 group-hover:rotate-12"
            />
            <CoinWordmark />
          </span>
        </a>

        <nav className={`hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.18em] ${muted}`} aria-label="Основная навигация">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={(event) => handleAnchorClick(event, link.href)} className="nav-link transition-colors hover:text-[#C98A12]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={brand.phoneHref} className="hidden sm:inline text-sm tracking-wide hover:text-[#C98A12] transition-colors">
            {brand.phone}
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden inline-flex min-h-11 min-w-11 items-center justify-center border border-current/20 rounded-full hover:text-[#C98A12] transition-colors"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <div className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className={`px-5 pb-5 flex flex-col gap-1 text-xs uppercase tracking-[0.18em] ${muted}`} aria-label="Мобильная навигация">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={(event) => { handleAnchorClick(event, link.href); setMenuOpen(false); }} className="py-3 border-t border-current/10 hover:text-[#C98A12] transition-colors">
              {link.label}
            </a>
          ))}
          <a href={brand.phoneHref} onClick={() => setMenuOpen(false)} className="pt-3 border-t border-current/10 text-[#C98A12]">
            {brand.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
