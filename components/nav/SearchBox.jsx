import { icons } from "../../utils/icons";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { useState } from "react";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { View, TextInput, Alert, Pressable } from "react-native";

export default function SearchBox({ initialQuery }) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || "");
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  const handleSearch = () => {
    if (query === "") {
      return Alert.alert(t.emptySearchHeader, t.emptySearchBody);
    }

    if (pathname.startsWith("/search")) {
      router.setParams({ searchquery: query });
    } else {
      router.push(`/search/${query}`);
    }
    setQuery("");
  };

  return (
    <View className="bg-grey-50 dark:bg-dark-secondary border border-grey-50 dark:border-grey-700 rounded-xl flex-row items-center space-x-8 focus:border-primary px-2 h-11 w-full">
      <Pressable
        className="rounded-l-xl items-center justify-center absolute left-0 h-full w-10"
        onPress={handleSearch}
      >
        <Image
          tintColor="#a4a4a4"
          source={icons.search}
          className="w-4 h-4"
          contentFit="contain"
        />
      </Pressable>
      <TextInput
        className="flex-1 text-dark-accent dark:text-grey-200 font-nregular"
        value={query}
        placeholder={t.search}
        placeholderTextColor="#a4a4a4"
        onChangeText={(e) => setQuery(e)}
        onSubmitEditing={handleSearch}
      />
    </View>
  );
}
