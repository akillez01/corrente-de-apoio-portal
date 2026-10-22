import type { Locale } from "./config";

export const uiDictionary = {
  pt: {
    nav: {
      support: "Apoiar com recursos",
      areas: "Areas prioritarias",
      howItWorks: "Como funciona",
      volunteer: "Quero ser voluntario",
      login: "Entrar",
    },
    footer: {
      tagline: "Rede ICEFLU de voluntariado, recursos e cuidado comunitario na Amazonia.",
      rights: "Todos os direitos reservados",
    },
  },
  en: {
    nav: {
      support: "Support with resources",
      areas: "Priority areas",
      howItWorks: "How it works",
      volunteer: "Become a volunteer",
      login: "Sign in",
    },
    footer: {
      tagline: "ICEFLU's network of volunteering, resources, and community care in the Amazon.",
      rights: "All rights reserved",
    },
  },
} as const;

export function getUiDictionary(locale: Locale) {
  return uiDictionary[locale];
}
