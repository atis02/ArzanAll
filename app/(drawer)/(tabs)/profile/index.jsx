import { icons } from "../../../../utils/icons";
import { CustomText } from "../../../../utils/CustomText";
import { useLanguageStore } from "../../../../utils/useLanguageStore";
import { useCustomerStore } from "../../../../utils/useCustomerStore";
import { router } from "expo-router";
import { useState } from "react";
import { Image } from "expo-image";
import { View, ScrollView, Pressable, Modal, Alert } from "react-native";
import { useColorScheme } from "nativewind";

const TabButton = ({ icon, title, onPress, isDark }) => {
  return (
    <Pressable
      onPress={onPress}
      className="bg-grey-50 dark:bg-dark-accent rounded-xl flex-row items-center active:bg-grey-100 dark:active:bg-dark-accent/50 mb-4 p-2 h-12"
    >
      <Image
        source={icon}
        contentFit="contain"
        className="mr-2 h-5 w-5"
        tintColor={isDark === "dark" ? "#e7e5ef" : "#474747"}
      />
      <CustomText classes="text-dark-primary dark:text-grey-200">
        {title}
      </CustomText>
      <Image
        source={icons.forward}
        contentFit="contain"
        className="ml-auto h-5 w-5"
        tintColor={isDark === "dark" ? "#e7e5ef" : "#474747"}
      />
    </Pressable>
  );
};

export default function ProfileScreen() {
  const { useCustomerData, updateCustomerData } = useCustomerStore();
  const [languageChangeModalVisible, setLanguageChangeModalVisible] =
    useState(false);
  const { changeLanguage, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-white dark:bg-dark-primary py-2 px-4"
    >
      <View>
        {useCustomerData?.id ? (
          <>
            <TabButton
              title={t.profile}
              onPress={() => router.navigate("/profile/edit")}
              icon={icons.user}
              isDark={colorScheme}
            />
            <TabButton
              title={t.signOut}
              onPress={() => {
                Alert.alert(
                  t.signOut,
                  t.signOutConfirm,
                  [
                    {
                      text: t.no,
                      style: "cancel",
                    },
                    {
                      text: t.yes,
                      onPress: () => updateCustomerData(null),
                    },
                  ],
                  { cancelable: true }
                );
              }}
              icon={icons.signOut}
              isDark={colorScheme}
            />
          </>
        ) : (
          <>
            <TabButton
              title={t.register}
              onPress={() => router.navigate("/profile/signup")}
              icon={icons.userPlus}
              isDark={colorScheme}
            />
            <TabButton
              title={t.loginToSystem}
              onPress={() => router.navigate("/profile/signin")}
              icon={icons.signIn}
              isDark={colorScheme}
            />
          </>
        )}
        <TabButton
          title={t.orders}
          onPress={() => router.navigate("/profile/orders")}
          icon={icons.list}
          isDark={colorScheme}
        />
        <TabButton
          title={t.orderRules}
          onPress={() => router.navigate("/profile/delivery")}
          icon={icons.truck}
          isDark={colorScheme}
        />
        <TabButton
          title={t.language}
          onPress={() => setLanguageChangeModalVisible(true)}
          icon={icons.globe}
          isDark={colorScheme}
        />
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
    </ScrollView>
  );
}
