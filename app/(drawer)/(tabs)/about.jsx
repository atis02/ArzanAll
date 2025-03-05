import { icons } from "../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../utils/utils";
import { useLanguageStore } from "../../../utils/useLanguageStore";
import { CustomText } from "../../../utils/CustomText";
import { useFetcher } from "../../../utils/useFetcher";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { View, ScrollView, Pressable, RefreshControl } from "react-native";
import { useColorScheme } from "nativewind";

export default function AboutScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const {
    data: response = {},
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/settings/get`);

  const onRefresh = () => {
    setRefreshing(true);
    mutate()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  if (isLoading)
    return (
      <View className="dark:bg-dark-primary items-center justify-center h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-white dark:bg-dark-primary px-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-row items-center h-14">
        <Pressable
          onPress={() => router.back()}
          className="bg-grey-50 dark:bg-dark-accent rounded-full items-center justify-center active:bg-grey-200 dark:active:bg-dark-accent/50 mr-2 h-10 w-10"
        >
          <Image
            source={icons.back}
            contentFit="contain"
            className="h-6 w-6"
            tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
          />
        </Pressable>
        <View className="justify-center items-start">
          <CustomText classes="font-nbold text-primary text-lg">
            {t.about}
          </CustomText>
        </View>
      </View>
      <View className="bg-grey-50 dark:bg-dark-accent rounded-xl p-2">
        <CustomText
          classes="text-dark-accent dark:text-grey-200"
          numberOfLines={300}
        >
          {language === "tm" ? response?.aboutTm : response?.aboutRu}
        </CustomText>
      </View>
      <View className="mb-4"></View>
    </ScrollView>
  );
}
