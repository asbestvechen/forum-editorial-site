import { useEffect, useState } from "react";
import { VariantEditorial } from "@/components/variants/VariantEditorial";
import { TeamPage } from "@/components/TeamPage";
import { EventsPage } from "@/components/EventsPage";
import { initializeSmoothScroll, scrollToElement, scrollToTop } from "@/lib/scroll";

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
          const target = !hash.startsWith("#/") && hash.length > 1
            ? document.getElementById(hash.slice(1))
            : null;

          if (target) {
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
