import { icons } from "../../utils/icons";
import { apiURL, LoadingLarge } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { useFetcher } from "../../utils/useFetcher";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { useEffect } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Pressable } from "react-native";

export default function CategoriesBox({ isRefreshing }) {
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();

  const {
    data: response = [],
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/categories/fetch/client`);

  useEffect(() => {
    if (isRefreshing) {
      mutate();
    }
  }, [isRefreshing, mutate]);

  if (isLoading) {
    return (
      <View className="items-center justify-center mt-2 h-[190px] w-full">
        <LoadingLarge />
      </View>
    );
  }

  if (error) return <></>;

  const categories = response?.categories || [];
  const glutenFreeCategory = categories.find(
    (item) => item.id === "6518dba0-f9c4-4264-9fa9-4f37c49ca328"
  );
  const otherCategories = categories.filter(
    (item) => item.id !== glutenFreeCategory?.id
  );

  const orderedCategories = glutenFreeCategory
    ? [...otherCategories.slice(0, 7)]
    : otherCategories.slice(0, 7);

  return (
    <View className="flex-row flex-wrap mt-2">
      {orderedCategories.slice(0, 7).map((item, index) => (
        <Pressable
          key={index}
          className="items-center justify-center active:opacity-70 mb-2 w-[25%]"
          onPress={() => router.navigate(`/categories/${item.id}`)}
        >
          <View className="items-center h-fit w-20">
            <View className="bg-grey-50 dark:bg-dark-secondary rounded-xl justify-center items-center h-20 w-20">
              {item?.image ? (
                <Image
                  source={`${apiURL}/${item.image}`}
                  contentFit="contain"
                  className="h-12 w-12"
                />
              ) : (
                <Image
                  source={icons.image}
                  contentFit="contain"
                  className="h-12 w-12"
                  tintColor="#a4a4a4"
                />
              )}
            </View>
            <View className="h-11 w-full">
              <CustomText
                classes="font-nsemibold text-center text-[10px] text-dark-accent dark:text-grey-200"
                numberOfLines={3}
              >
                {language === "tm" ? item.nameTm : item.nameRu}
              </CustomText>
            </View>
          </View>
        </Pressable>
      ))}
      <Pressable
        onPress={() => router.navigate(`/categories`)}
        className="justify-center items-center active:opacity-70 mb-2 w-[25%]"
      >
        <View className="bg-grey-50 dark:bg-dark-secondary rounded-xl justify-center items-center h-20 w-20">
          <Image
            source={icons.forward}
            contentFit="contain"
            className="h-8 w-8"
            tintColor="#ff9700"
          />
        </View>
        <View className="h-11 w-full">
          <CustomText
            classes="font-nsemibold text-dark-accent dark:text-grey-200 text-center text-[10px]"
            numberOfLines={2}
          >
            {t.showAll}
          </CustomText>
        </View>
      </Pressable>
    </View>
  );
}
