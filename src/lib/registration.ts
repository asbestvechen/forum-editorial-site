import { apiClient } from "@adaptive-ai/sdk/client";
import { env } from "@/lib/env";
import type { FeaturedEvent } from "@/lib/events";

export type RegistrationInput = {
  fullName: string;
  phone: string;
  eventId?: string;
  event?: FeaturedEvent;
};

export type ContactRequestInput = {
  fullName: string;
  phone: string;
};

export type RegistrationResponse = {
  id: string;
  notification: string;
};

type EventsApi = {
  createEventRegistration: (input: RegistrationInput) => Promise<RegistrationResponse>;
  createContactRequest: (input: ContactRequestInput) => Promise<RegistrationResponse>;
};

type RegistrationErrorPayload = {
  error?: string | { message?: string };
};

const api = apiClient<EventsApi>();

export function formatRussianPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith("7")) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const area = digits.slice(1, 4);
  const first = digits.slice(4, 7);
  const second = digits.slice(7, 9);
  const third = digits.slice(9, 11);
  let formatted = "+7";
  if (area) formatted += ` (${area}`;
  if (area.length === 3) formatted += ")";
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;
  return formatted;
}

function isGitHubPages() {
  return typeof window !== "undefined" && window.location.hostname.endsWith(".github.io");
}

async function requestRegistration(endpoint: string, input: RegistrationInput) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null) as RegistrationResponse | RegistrationErrorPayload | null;
  if (!response.ok) {
    const error = payload && "error" in payload ? payload.error : undefined;
    const message = typeof error === "string" ? error : error?.message;
    throw new Error(message ?? `Не удалось отправить заявку (${response.status})`);
  }
  if (!payload || !("id" in payload)) throw new Error("Сервер вернул некорректный ответ");
  return payload as RegistrationResponse;
}

async function requestContactRequest(endpoint: string, input: ContactRequestInput) {
  return requestRegistration(endpoint, { ...input, kind: "contact" } as RegistrationInput & { kind: "contact" });
}

export async function submitRegistration(input: RegistrationInput) {
  if (isGitHubPages()) {
    if (!env.VITE_REGISTRATION_API_URL) throw new Error("Endpoint регистрации ещё не настроен");
    return requestRegistration(env.VITE_REGISTRATION_API_URL, input);
  }

  try {
    return await api.createEventRegistration(input);
  } catch (rpcError) {
    // The static export can also be served by scripts/standalone-server.ts.
    // Try that endpoint only after the Adaptive RPC, while preserving the
    // actionable RPC error if neither backend is available.
    try {
      return await requestRegistration("./api/register", input);
    } catch {
      // Fall through to the original RPC error below.
    }
    throw rpcError instanceof Error ? rpcError : new Error("Не удалось отправить заявку");
  }
}

export async function submitContactRequest(input: ContactRequestInput) {
  if (isGitHubPages()) {
    if (!env.VITE_REGISTRATION_API_URL) throw new Error("Endpoint обратной связи ещё не настроен");
    return requestContactRequest(env.VITE_REGISTRATION_API_URL, input);
  }

  try {
    return await api.createContactRequest(input);
  } catch (rpcError) {
    try {
      return await requestContactRequest("./api/register", input);
    } catch {
      // Fall through to the original RPC error below.
    }
    throw rpcError instanceof Error ? rpcError : new Error("Не удалось отправить заявку");
  }
}
