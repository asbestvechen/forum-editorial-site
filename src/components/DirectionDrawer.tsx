import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import type { Category } from "@/lib/brand";

type DirectionDrawerProps = {
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  onSelect: (category: Category) => void;
};

const formatIndex = (index: number) => String(index + 1).padStart(2, "0");
const SWIPE_THRESHOLD = 52;

export function DirectionDrawer({ category, categories, onClose, onSelect }: DirectionDrawerProps) {
  const [displayedCategory, setDisplayedCategory] = useState<Category | null>(category);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const swipeStartRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const isOpen = Boolean(category);

  useEffect(() => {
    if (category) {
      setDisplayedCategory(category);
      return;
    }

    const timeout = window.setTimeout(() => setDisplayedCategory(null), 420);
    return () => window.clearTimeout(timeout);
  }, [category]);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElementRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  if (!displayedCategory) return null;

  const activeIndex = categories.findIndex((item) => item.slug === displayedCategory.slug);
  const previousCategory = categories[(activeIndex - 1 + categories.length) % categories.length];
  const nextCategory = categories[(activeIndex + 1) % categories.length];

  const handleSwipeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType !== "touch" && event.pointerType !== "pen")) return;
    if ((event.target as HTMLElement).closest("a, button, input, select, textarea")) return;
    swipeStartRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const resetSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeStartRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    swipeStartRef.current = null;
  };

  const handleSwipeEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    resetSwipe(event);

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;

    event.preventDefault();
    if (deltaX < 0) {
      if (nextCategory) onSelect(nextCategory);
      return;
    }
    if (previousCategory) onSelect(previousCategory);
  };

  return (
    <div
      className={`direction-drawer ${isOpen ? "direction-drawer--open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div className="direction-drawer__backdrop" onMouseDown={onClose} />
      <aside
        className="direction-drawer__panel"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby={`direction-drawer-title-${displayedCategory.slug}`}
        aria-describedby={`direction-drawer-description-${displayedCategory.slug}`}
      >
        <div className="direction-drawer__topline">
          <p className="eyebrow text-[#C98A12]">
            Направление {formatIndex(activeIndex < 0 ? 0 : activeIndex)} / {formatIndex(categories.length - 1)}
          </p>
          <button ref={closeButtonRef} type="button" className="direction-drawer__close" onClick={onClose} aria-label="Закрыть описание направления">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div
          className="direction-drawer__scroll-area"
          onPointerDown={handleSwipeStart}
          onPointerUp={handleSwipeEnd}
          onPointerCancel={resetSwipe}
        >
          <div className="direction-drawer__image-wrap">
            <img src={displayedCategory.image} alt="" className="direction-drawer__image" />
            <span className="direction-drawer__image-label">ФОРУМ · коллекция решений</span>
          </div>

          <div className="direction-drawer__content">
            <p className="direction-drawer__kicker">Для вашего пространства</p>
            <h2
              id={`direction-drawer-title-${displayedCategory.slug}`}
              className={`direction-drawer__title font-display ${displayedCategory.slug === "stone-sanitary" ? "direction-drawer__title--compact" : ""}`}
            >
              {displayedCategory.title}
            </h2>
            <div className="direction-drawer__rule" />
            <p id={`direction-drawer-description-${displayedCategory.slug}`} className="direction-drawer__details">
              {displayedCategory.details}
            </p>
            <div className="direction-drawer__brands">
              <p className="direction-drawer__brands-label">{displayedCategory.brandLabel}</p>
              <div className="direction-drawer__brands-list" aria-label={`${displayedCategory.brandLabel}: ${displayedCategory.title}`}>
                {displayedCategory.brands.map((brandName) => <BrandLogo key={brandName} name={brandName} />)}
              </div>
            </div>

            <a href="#contacts" className="direction-drawer__cta" onClick={onClose}>
              Обсудить проект <ArrowUpRight size={16} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div className="direction-drawer__navigation">
          <button type="button" onClick={() => previousCategory && onSelect(previousCategory)} disabled={!previousCategory}>
            <ChevronLeft size={16} strokeWidth={1.5} />
            <span>Назад</span>
          </button>
          <span>{formatIndex(activeIndex < 0 ? 0 : activeIndex)} — {formatIndex(categories.length - 1)}</span>
          <button type="button" onClick={() => nextCategory && onSelect(nextCategory)} disabled={!nextCategory}>
            <span>Далее</span>
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </aside>
    </div>
  );
}
