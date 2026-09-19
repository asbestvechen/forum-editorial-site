import Lenis from "lenis";

let activeLenis: Lenis | null = null;

const pageAnchorIds = new Set(["directions", "about", "location", "contacts"]);

export function getPageAnchorId(hash: string) {
  const id = hash.replace(/^#\/?/, "");
  return pageAnchorIds.has(id) ? id : null;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initializeSmoothScroll() {
  if (typeof window === "undefined") return () => undefined;

  const instance = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    syncTouch: false,
    lerp: 0.075,
    wheelMultiplier: 0.92,
    anchors: false,
    respectReducedMotion: true,
    prevent: (node) => {
      return Boolean(node.closest("[data-lenis-prevent]"));
    },
  });

  activeLenis = instance;
  let frame = window.requestAnimationFrame(function raf(time) {
    instance.raf(time);
    frame = window.requestAnimationFrame(raf);
  });

  return () => {
    window.cancelAnimationFrame(frame);
    instance.destroy();
    if (activeLenis === instance) activeLenis = null;
  };
}

export function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = "smooth") {
  const headerHeight = document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().height ?? 0;
  const offset = headerHeight + 48;
  const immediate = prefersReducedMotion() || behavior === "auto";

  const documentTop = element.getBoundingClientRect().top + window.scrollY;
  const top = Math.max(0, documentTop - offset);

  if (activeLenis) {
    activeLenis.scrollTo(top, {
      immediate,
      duration: 1.15,
      programmatic: true,
    });
    return;
  }

  window.scrollTo({
    top,
    behavior: immediate ? "auto" : behavior,
  });
}

export function scrollToTop(behavior: ScrollBehavior = "smooth") {
  const immediate = prefersReducedMotion() || behavior === "auto";

  if (activeLenis) {
    activeLenis.scrollTo(0, {
      immediate,
      duration: 1.15,
      programmatic: true,
    });
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: immediate ? "auto" : behavior,
  });
}
