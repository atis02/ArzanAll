import { icons } from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { View, Pressable } from "react-native";
import { useColorScheme } from "nativewind";

export default function NavBar() {
  const navigation = useNavigation();
  const { changeLanguage, language } = useLanguageStore();
  const { colorScheme } = useColorScheme();

  return (
    <View className="bg-white dark:bg-dark-primary border-b border-grey-200 dark:border-dark-accent flex-row items-center justify-between px-4 h-16">
      <Pressable
        onPress={() => navigation.openDrawer()}
        className="items-start justify-center active:opacity-70 h-11 w-11"
      >
        <Image
          source={icons.menuBurger}
          contentFit="contain"
          className="h-7 w-7"
          tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
        />
      </Pressable>
      <Pressable
        onPress={() => router.navigate("/")}
        className="flex flex-row items-center active:opacity-70"
      >
        <Image
          source={icons.logoNoText}
          contentFit="contain"
          className="mr-1 h-8 w-8"
        />
        <CustomText classes="text-lg text-primary font-nbold">
          Arzan Al Market
        </CustomText>
      </Pressable>
      <View className="flex-row items-center">
        <Pressable
          onPress={() => changeLanguage(language === "tm" ? "ru" : "tm")}
          className="bg-grey-50 dark:bg-dark-accent rounded-full items-center justify-center active:opacity-70 h-9 w-9"
        >
          <CustomText classes="text-dark-accent dark:text-grey-200 font-nbold">
            {language === "tm" ? "TM" : "РУ"}
          </CustomText>
        </Pressable>
        <Pressable
          onPress={() =>
            router.navigate("/categories/6518dba0-f9c4-4264-9fa9-4f37c49ca328")
          }
          className="items-center justify-center active:opacity-70 h-11 w-11"
        >
          <Image
            source={icons.gluten}
            contentFit="contain"
            className="h-9 w-9"
          />
        </Pressable>
      </View>
    </View>
  );
}
