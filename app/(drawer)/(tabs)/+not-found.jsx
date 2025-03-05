import { CustomText } from "../../../utils/CustomText";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguageStore } from "../../../utils/useLanguageStore";

export default function NotFoundRoute() {
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  return (
    <SafeAreaView className="bg-white dark:bg-dark-primary items-center justify-center h-full">
      <CustomText classes="font-nsemibold text-4xl dark:text-white">
        404
      </CustomText>
      <CustomText classes="font-nbold dark:text-white">
        {t.pageNotFound}
      </CustomText>
      <Pressable
        onPress={() => {
          router.navigate("/");
        }}
        className="bg-primary rounded-xl items-center justify-center active:bg-primary-600 mt-2 px-2 h-11"
      >
        <CustomText classes="text-white font-nitalic">{t.goHome}</CustomText>
      </Pressable>
    </SafeAreaView>
  );
}
