import { useLanguageStore } from "../../utils/useLanguageStore";
import { useEffect } from "react";
import { Alert, BackHandler } from "react-native";
import { useRouter, useSegments } from "expo-router";

export default function useExitAppConfirmation() {
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      if (
        segments.length === 2 &&
        segments[0] === "(drawer)" &&
        segments[1] === "(tabs)"
      ) {
        Alert.alert(t.exitHeader, t.exitText, [
          {
            text: t.no,
            onPress: () => null,
            style: "cancel",
          },
          { text: t.yes, onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }

      if (router.canGoBack()) {
        router.back();
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [language, segments, router]);
}
