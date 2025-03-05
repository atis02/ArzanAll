import useExitAppConfirmation from "../../components/nav/ExitHandler";
import { icons } from "../../utils/icons.js";
import { apiURL } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { LoadingLarge } from "../../utils/utils";
import { useFetcher } from "../../utils/useFetcher";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { Pressable, Linking, View, Modal, Switch } from "react-native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { router, usePathname } from "expo-router";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DrawerButton = ({ name, icon, focused, onPress, isDark }) => {
  return (
    <Pressable
      onPress={onPress}
      className={`border-b border-grey flex-row items-center active:opacity-80 mb-1 px-2 min-h-[44px] h-fit w-full ${
        focused ? "border-primary" : "border-grey-400"
      }`}
    >
      {icon && (
        <Image
          source={icon}
          tintColor={focused ? "#ff9700" : isDark ? "#e7e5ef" : "#343a46"}
          className="mr-2 h-5 w-5"
        />
      )}
      <CustomText
        classes={
          focused
            ? "text-primary"
            : "text-dark-accent dark:text-grey-200 max-w-[200px]"
        }
        numberOfLines={6}
      >
        {name}
      </CustomText>
    </Pressable>
  );
};

const CustomDrawerContent = () => {
  const [languageChangeModalVisible, setLanguageChangeModalVisible] =
    useState(false);
  const [isDarkThemeEnabled, setIsDarkThemeEnabled] = useState(false);
  const { setColorScheme, colorScheme } = useColorScheme();
  const { getTranslations, changeLanguage } = useLanguageStore();
  const pathname = usePathname();
  const navigation = useNavigation();
  const t = getTranslations();
  useExitAppConfirmation();

  const {
    data: response = {},
    error,
    isLoading,
  } = useFetcher(`${apiURL}/settings/get`);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      const themeToUse = savedTheme || "light";
      setColorScheme(themeToUse);
      setIsDarkThemeEnabled(themeToUse === "dark");
    } catch (e) {
      console.error("Failed to load theme from storage:", e);
    }
  };

  const saveTheme = async (theme) => {
    try {
      await AsyncStorage.setItem("theme", theme);
    } catch (e) {
      console.error("Failed to save theme to storage:", e);
    }
  };

  const toggleTheme = () => {
    const newScheme = colorScheme === "light" ? "dark" : "light";
    setColorScheme(newScheme);
    setIsDarkThemeEnabled(newScheme === "dark");
    saveTheme(newScheme);
  };

  useEffect(() => {
    loadTheme();
  }, []);

  if (isLoading)
    return (
      <View className="bg-white dark:bg-dark-accent pt-4 h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  return (
    <DrawerContentScrollView
      contentContainerStyle={{ flex: 1 }}
      style={{
        backgroundColor: colorScheme === "dark" ? "#343a46" : "#ffffff",
        paddingTop: 16,
        paddingHorizontal: 12,
      }}
    >
      <View className="flex-row items-center justify-between w-full">
        <Pressable
          onPress={() => router.navigate("/")}
          className="flex-row items-center h-11 w-11"
        >
          <Image
            source={icons.logoNoText}
            contentFit="contain"
            className="h-11 w-11"
          />
        </Pressable>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}
          className="flex-row items-center h-11"
        >
          <Image
            source={icons.cross}
            contentFit="contain"
            className="h-8 w-8"
            tintColor={colorScheme === "dark" ? "#a4a4a4" : "#343a46"}
          />
        </Pressable>
      </View>
      <DrawerButton
        name={t.call}
        icon={icons.phone}
        onPress={() => {
          const phoneNumber = response?.contactNumberOne;
          Linking.openURL(`tel:${phoneNumber}`);
        }}
        isDark={colorScheme === "dark" ? true : false}
      />
      <DrawerButton
        name={t.call + " 2"}
        icon={icons.phone}
        onPress={() => {
          const phoneNumber = response?.contactNumberTwo;
          Linking.openURL(`tel:${phoneNumber}`);
        }}
        isDark={colorScheme === "dark" ? true : false}
      />
      <DrawerButton
        name={t.write}
        icon={icons.message}
        onPress={() => {
          const phoneNumber = response?.contactNumberOne;
          Linking.openURL(`sms:${phoneNumber}`);
        }}
        isDark={colorScheme === "dark" ? true : false}
      />
      <DrawerButton
        name={t.write + " 2"}
        icon={icons.message}
        onPress={() => {
          const phoneNumber = response?.contactNumberTwo;
          Linking.openURL(`sms:${phoneNumber}`);
        }}
        isDark={colorScheme === "dark" ? true : false}
      />
      <DrawerButton
        name={t.about}
        icon={icons.info}
        focused={pathname === "/about"}
        onPress={() => router.navigate("/(drawer)/(tabs)/about")}
        isDark={colorScheme === "dark" ? true : false}
      />
      <DrawerButton
        name={t.usage}
        icon={icons.list}
        focused={pathname === "/usage"}
        onPress={() => router.navigate("/(drawer)/(tabs)/usage")}
        isDark={colorScheme === "dark" ? true : false}
      />
      <DrawerButton
        name={t.chooseLanguage}
        icon={icons.globe}
        onPress={() => {
          setLanguageChangeModalVisible(true);
        }}
        isDark={colorScheme === "dark" ? true : false}
      />
      <Pressable
        onPress={toggleTheme}
        className="border-b border-grey flex-row items-center active:opacity-80 mb-1 px-2 min-h-[44px] h-fit w-full"
      >
        <Image
          source={icons.moon}
          tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
          className="mr-2 h-5 w-5"
        />
        <CustomText
          classes={`text-dark-accent dark:text-grey-200 max-w-[200px]`}
        >
          {t.darkTheme}
        </CustomText>
        <Switch
          value={isDarkThemeEnabled}
          onValueChange={toggleTheme}
          style={{ marginLeft: "auto" }}
          trackColor={{ false: "#dfdfdf", true: "#ffbb1b" }}
          thumbColor={isDarkThemeEnabled ? "#ff9700" : "#a4a4a4"}
        />
      </Pressable>
      <View className="items-center justify-center mt-auto mb-4">
        <Pressable
          onPress={() => {
            const url = "https://alemtilsimat.com/";
            Linking.openURL(url);
          }}
          className="flex-row items-center active:opacity-50"
        >
          <CustomText classes="text-dark-accent dark:text-grey-200">
            Powered by{" "}
            <CustomText classes="font-nsemibold text-primary">
              Älem Tilsimat
            </CustomText>
          </CustomText>
        </Pressable>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={languageChangeModalVisible}
      >
        <View className="flex-1 items-center justify-center">
          <View className="bg-grey-50 dark:bg-dark-accent border border-grey-400 dark:border-grey-700 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <View className="flex-row justify-between items-center w-full">
              <CustomText classes="text-base text-dark-accent dark:text-grey-200">
                {t.chooseLanguage}
              </CustomText>
              <Pressable
                onPress={() => setLanguageChangeModalVisible(false)}
                className="border border-grey-800 dark:border-grey-200 rounded-xl items-center justify-center active:border-primary ml-auto h-9 w-9"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-6 w-6"
                  tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
                />
              </Pressable>
            </View>
            <View className="rounded-xl justify-between items-center w-full">
              <Pressable
                onPress={() => {
                  changeLanguage("tm");
                  setLanguageChangeModalVisible(false);
                }}
                className="bg-primary rounded-xl items-center justify-center active:bg-primary-600 h-11 w-full"
              >
                <CustomText classes="font-nsemibold text-base text-white">
                  Türkmen
                </CustomText>
              </Pressable>
              <Pressable
                onPress={() => {
                  changeLanguage("ru");
                  setLanguageChangeModalVisible(false);
                }}
                className="bg-primary rounded-xl items-center justify-center mt-2 active:bg-primary-600 h-11 w-full"
              >
                <CustomText classes="font-nsemibold text-base text-white">
                  Русский
                </CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar
        backgroundColor={colorScheme === "dark" ? "#1b1c1d" : "#ffffff"}
        style={colorScheme === "dark" ? "light" : "dark"}
      />
    </DrawerContentScrollView>
  );
};

export default () => {
  return (
    <Drawer
      drawerContent={() => <CustomDrawerContent />}
      screenOptions={{ headerShown: false }}
    />
  );
};
