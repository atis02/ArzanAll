import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tm from "../locales/tm.json";
import ru from "../locales/ru.json";

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: "",
      modalShown: false,
      changeLanguage: (newLanguage) =>
        set(() => ({ language: newLanguage, modalShown: true })),
      getTranslations: () => {
        const language = get().language;
        switch (language) {
          case "tm":
            return tm;
          case "ru":
            return ru;
          default:
            return tm;
        }
      },
    }),
    {
      name: "app-language",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
