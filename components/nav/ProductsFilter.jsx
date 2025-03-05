import { icons } from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { useState } from "react";
import { Image } from "expo-image";
import { Modal, View, Pressable } from "react-native";
import { useColorScheme } from "nativewind";

const sortByOptins = [
  {
    id: 1,
    nameTm: "Arzandan gymmada",
    nameRu: "Сначала низкие цены",
    value: "asc",
    icon: icons.down,
  },
  {
    id: 2,
    nameTm: "Gymmatdan arzana",
    nameRu: "Сначала высокие цены",
    value: "desc",
    icon: icons.up,
  },
];

export default function ProductsFilter({ onSortChange }) {
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSortValue, setSelectedSortValue] = useState();
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const handleSortSelection = (id, value) => {
    setSelectedSortValue(id);
    onSortChange(value);
    setSortModalVisible(false);
  };

  return (
    <View className="mt-2 w-full">
      <Pressable
        onPress={() => {
          setSortModalVisible(true);
        }}
        className="bg-primary rounded-xl flex-row justify-center items-center active:bg-primary-600 px-4 h-11"
      >
        <Image
          source={icons.filter}
          contentFit="contain"
          className="mr-2 h-4 w-4"
          tintColor="#ffffff"
        />
        <CustomText classes="text-white">{t.sortBy}</CustomText>
      </Pressable>
      <Modal
        transparent={true}
        visible={sortModalVisible}
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View className="flex-1 bg-white/30 dark:bg-dark-primary/50 justify-center items-center">
          <View className="bg-grey-50 dark:bg-dark-accent border border-grey-200 dark:border-grey-700 rounded-xl items-center space-y-2 p-2 h-auto w-[300px]">
            <View className="flex-row justify-between items-center w-full">
              <CustomText classes="text-base text-dark-primary dark:text-white">
                {t.sorting}
              </CustomText>
              <Pressable
                onPress={() => setSortModalVisible(false)}
                className="border border-grey-300 dark:border-grey-200 rounded-xl items-center justify-center active:opacity-50 ml-auto h-9 w-9"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-5 w-5"
                  tintColor={colorScheme === "dark" ? "#e7e5ef" : "#474747"}
                />
              </Pressable>
            </View>
            <View className="rounded-xl items-center space-y-2 w-full">
              {sortByOptins?.map((item) => (
                <View className="w-full" key={item.id}>
                  <Pressable
                    onPress={() => handleSortSelection(item.id, item.value)}
                    className={`border rounded-xl flex flex-row justify-center items-center active:opacity-80 h-12 w-full ${
                      selectedSortValue === item.id
                        ? "border-primary bg-primary-100 dark:bg-primary"
                        : "border-grey-200 dark:border-grey-700 bg-white dark:bg-dark-primary "
                    }`}
                  >
                    <Image
                      source={item.icon}
                      contentFit="contain"
                      className="mr-2 h-4 w-4"
                      tintColor={colorScheme === "dark" ? "#e7e5ef" : "#474747"}
                    />
                    <CustomText
                      classes={`${
                        selectedSortValue === item.id
                          ? "text-primary dark:text-white"
                          : "text-dark-primary dark:text-grey-200"
                      }`}
                    >
                      {language === "tm" ? item.nameTm : item.nameRu}
                    </CustomText>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
