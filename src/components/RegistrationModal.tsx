import { useEffect, useState, type FormEvent } from "react";
import { Check, X } from "lucide-react";
import { fallbackEventsPage, type FeaturedEvent } from "@/lib/events";
import { brand } from "@/lib/brand";
import { formatRussianPhone, submitContactRequest, submitRegistration } from "@/lib/registration";

type RegistrationModalProps = {
  open: boolean;
  event?: FeaturedEvent | null;
  onClose: () => void;
  mode?: "event" | "contact";
};

export function RegistrationModal({ open, event, onClose, mode = "event" }: RegistrationModalProps) {
  const isContact = mode === "contact";
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [loadedEvent, setLoadedEvent] = useState<FeaturedEvent | null | undefined>(event);

  useEffect(() => {
    if (!open) return;
    setLoadedEvent(isContact ? null : event);
    if (isContact || event !== undefined) return;

    fetch("./events.json", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ featuredEvent?: FeaturedEvent | null }> : null)
      .then((data) => setLoadedEvent(data?.featuredEvent ?? null))
      .catch(() => setLoadedEvent(null));
  }, [event, isContact, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setState("submitting");
    setError("");
    try {
      if (isContact) {
        await submitContactRequest({ fullName, phone });
      } else {
        await submitRegistration({
          fullName,
          phone,
          eventId: loadedEvent?.id,
          event: loadedEvent ?? undefined,
        });
      }
      setState("success");
      setFullName("");
      setPhone("");
    } catch (requestError) {
      setState("error");
      setError(requestError instanceof Error ? requestError.message : "Не удалось отправить заявку");
    }
  };

  return (
    <div className="registration-modal" role="presentation" onMouseDown={(mouseEvent) => {
      if (mouseEvent.target === mouseEvent.currentTarget) onClose();
    }}>
      <div className="registration-modal__panel" role="dialog" aria-modal="true" aria-labelledby="registration-modal-title">
        <div className="registration-modal__header">
          <div>
            <p className="events-kicker">{isContact ? "ФОРУМ · КОНТАКТЫ" : "Личная встреча"}</p>
            <h2 id="registration-modal-title">{isContact ? "Связаться с нами" : "Записаться на мероприятие"}</h2>
          </div>
          <button className="registration-modal__close" type="button" onClick={onClose} aria-label="Закрыть окно">
            <X size={18} strokeWidth={1.4} />
          </button>
        </div>
        {state === "success" ? (
          <div className="registration-modal__success">
            <Check size={24} strokeWidth={1.4} />
            <strong>Заявка принята</strong>
            <span>{isContact ? "Спасибо, мы свяжемся с вами в ближайшее время." : "Мы свяжемся с вами и подтвердим участие."}</span>
            <button className="editorial-button editorial-button--light" type="button" onClick={onClose}>Закрыть</button>
          </div>
        ) : (
          <form className="registration-modal__form" onSubmit={handleSubmit}>
            {!isContact && (
              <p className="registration-modal__event">
                {loadedEvent?.title ?? fallbackEventsPage.featuredEvent?.title ?? "Оставьте контакты — мы свяжемся с вами"}
              </p>
            )}
            <label>
              <span>Имя и фамилия</span>
              <input value={fullName} onChange={(changeEvent) => setFullName(changeEvent.target.value)} name="fullName" autoComplete="name" required placeholder="Как к вам обращаться" />
            </label>
            <label>
              <span>Номер телефона</span>
              <input value={phone} onChange={(changeEvent) => setPhone(formatRussianPhone(changeEvent.target.value))} name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+7 (900) 000-00-00" />
            </label>
            {state === "error" && <p className="registration-modal__error" role="alert">{error}</p>}
            <button className="editorial-button editorial-button--light registration-modal__submit" type="submit" disabled={state === "submitting"}>
              {state === "submitting" ? "Отправляем…" : isContact ? "Отправить" : "Отправить заявку"}
            </button>
            {isContact && (
              <div className="registration-modal__direct" aria-label="Прямая связь с Максом">
                <span className="registration-modal__direct-label">Прямая связь</span>
                <div className="registration-modal__direct-links">
                  <a className="registration-modal__direct-link" href={brand.directContact.phoneHref}>
                    <span>Телефон</span>
                    <strong>{brand.directContact.phone}</strong>
                  </a>
                  <a className="registration-modal__direct-link" href={brand.directContact.telegramHref} target="_blank" rel="noreferrer">
                    <span>Telegram · {brand.directContact.name}</span>
                    <strong>{brand.directContact.telegram}</strong>
                  </a>
                </div>
              </div>
            )}
            <p className="registration-modal__note">Нажимая кнопку, вы соглашаетесь на обработку контактных данных.</p>
          </form>
        )}
      </div>
    </div>
  );
}
