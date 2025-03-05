import SearchBox from "../../../../components/nav/SearchBox";
import { icons } from "../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useFetcher } from "../../../../utils/useFetcher";
import { useLanguageStore } from "../../../../utils/useLanguageStore";
import { useState } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { View, ScrollView, RefreshControl, Pressable } from "react-native";

const Button = ({ title, image, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center h-fit w-[25%]"
    >
      <View className="items-center h-fit">
        <View className="bg-grey-50 dark:bg-dark-accent rounded-xl items-center justify-center h-20 w-20">
          <Image
            source={image?.length > 0 ? `${apiURL}/${image}` : icons.logoNoText}
            contentFit="contain"
            className="h-14 w-14"
            tintColor={image?.length > 0 ? "" : "#a4a4a4"}
          />
        </View>
        <View className="h-12">
          <CustomText
            classes="font-nmedium text-center text-xs text-dark-accent dark:text-grey-200"
            numberOfLines={3}
          >
            {title}
          </CustomText>
        </View>
      </View>
    </Pressable>
  );
};

export default function AllCategoriesScreen() {
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const {
    data: response = [],
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/categories/fetch/client`);

  const [refreshing, setRefreshing] = useState(false);

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

  const categories = response?.categories || [];
  const glutenFreeCategory = categories.find(
    (item) => item.id === "6518dba0-f9c4-4264-9fa9-4f37c49ca328"
  );
  const otherCategories = categories.filter(
    (item) => item.id !== glutenFreeCategory?.id
  );

  const orderedCategories = glutenFreeCategory
    ? [glutenFreeCategory, ...otherCategories]
    : otherCategories;

  return (
    <ScrollView
      className="bg-white dark:bg-dark-primary py-2 px-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="justify-center items-start mb-2">
        <CustomText classes="font-nbold text-primary text-lg">
          {t.categories}
        </CustomText>
        <View className="mt-2">
          <SearchBox />
        </View>
      </View>
      <View className="flex-row flex-wrap items-center h-fit w-full">
        {orderedCategories.map((item) => (
          <Button
            onPress={() => router.push(`/categories/${item.id}`)}
            image={item?.image}
            title={language === "tm" ? item?.nameTm : item?.nameRu}
            key={item.id}
          />
        ))}
      </View>
      <View className="mb-4"></View>
    </ScrollView>
  );
}
