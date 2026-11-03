import { useEffect, useState } from "react";
import { VariantEditorial } from "@/components/variants/VariantEditorial";
import { TeamPage } from "@/components/TeamPage";
import { EventsPage } from "@/components/EventsPage";
import { getPageAnchorId, initializeSmoothScroll, scrollToElement, scrollToTop } from "@/lib/scroll";

function App() {
  const [page, setPage] = useState(() => window.location.hash === "#/team" ? "team" : window.location.hash === "#/events" ? "events" : "home");

  useEffect(() => {
    const cleanupSmoothScroll = initializeSmoothScroll();
    const handleHashChange = () => {
      const hash = window.location.hash;
      const nextPage = hash === "#/team" ? "team" : hash === "#/events" ? "events" : "home";
      setPage(nextPage);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const anchorId = getPageAnchorId(hash);
          const target = anchorId ? document.getElementById(anchorId) : null;

          if (target) {
            if (hash !== `#${anchorId}`) window.history.replaceState({}, "", `#${anchorId}`);
            scrollToElement(target);
          } else {
            scrollToTop();
          }
        });
      });
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
      cleanupSmoothScroll();
    };
  }, []);

  return (
    <>{page === "team" ? <TeamPage /> : page === "events" ? <EventsPage /> : <VariantEditorial />}</>
  );
}

export default App;
