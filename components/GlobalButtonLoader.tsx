"use client";

import { useEffect } from "react";

function showLoading(button: HTMLButtonElement) {
  if (button.dataset.loadingBound === "true" || button.disabled) {
    return;
  }

  button.dataset.loadingBound = "true";
  button.dataset.originalHtml = button.innerHTML;

  button.classList.add("pointer-events-none", "opacity-70", "animate-pulse");
  button.disabled = true;

  const text = button.textContent?.trim() || "";
  const labelMarkup = text ? `<span>${text}</span>` : "";

  button.innerHTML = `
    <span class="inline-flex items-center justify-center gap-2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" class="h-4 w-4 animate-spin" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-6.2-8.6" strokeLinecap="round" />
      </svg>
      ${labelMarkup}
    </span>
  `;
}

function hideLoading(button: HTMLButtonElement) {
  button.disabled = false;
  button.classList.remove("pointer-events-none", "opacity-70", "animate-pulse");

  if (button.dataset.originalHtml) {
    button.innerHTML = button.dataset.originalHtml;
  }

  delete button.dataset.originalHtml;
  delete button.dataset.loadingBound;
}

export default function GlobalButtonLoader() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest("button") as HTMLButtonElement | null;
      if (!button) {
        return;
      }

      showLoading(button);
      window.setTimeout(() => hideLoading(button), 1000);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
