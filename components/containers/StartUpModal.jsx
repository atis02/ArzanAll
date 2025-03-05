import Constants from "expo-constants";
import { icons } from "../../utils/icons";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { apiURL } from "../../utils/utils";
import { router } from "expo-router";
import { CustomText } from "../../utils/CustomText";
import { Modal, View, Pressable, Linking, Platform } from "react-native";
import { useLanguageStore } from "../../utils/useLanguageStore";

export default function StartUpModal({
  languageIsVisible,
  setLanguageIsVisible,
  isAllowed,
  noInternet,
}) {
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [shuffledAds, setShuffledAds] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);
  const [forceUpdateRequired, setForceUpdateRequired] = useState(false);
  const { getTranslations, changeLanguage, language, modalShown } =
    useLanguageStore();
  const t = getTranslations();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`${apiURL}/popup/active`);
        const result = await response.json();
        const ads = result?.popUps || [];
        const shuffled = [...ads].sort(() => 0.5 - Math.random());
        setShuffledAds(shuffled);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (modalShown && language) {
      setLanguageIsVisible(true);
    }
  }, [modalShown, language]);

  const currentVersion = Constants.expoConfig.version;

  const compareVersions = (currentVer, serverVer) => {
    const current = currentVer.split(".").map(Number);
    const server = serverVer.split(".").map(Number);

    for (let i = 0; i < Math.max(current.length, server.length); i++) {
      const currentPart = current[i] || 0;
      const serverPart = server[i] || 0;

      if (serverPart > currentPart) return true;
      if (currentPart > serverPart) return false;
    }
    return false;
  };

  const checkForUpdate = async () => {
    try {
      const response = await fetch(`${apiURL}/settings/get`);
      const data = await response.json();

      const serverVersion =
        Platform.OS === "ios" ? data.iosVersion : data.androidVersion;
      const updateNeeded = compareVersions(currentVersion, serverVersion);

      if (updateNeeded) {
        setForceUpdateRequired(true);
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  useEffect(() => {
    checkForUpdate();
  }, []);

  useEffect(() => {
    if (!forceUpdateRequired) {
      const fetchAds = async () => {
        try {
          const response = await fetch(`${apiURL}/popup/active`);
          const result = await response.json();
          const ads = result?.popUps || [];
          const shuffled = [...ads].sort(() => 0.5 - Math.random());
          setShuffledAds(shuffled);
        } catch (error) {
          console.error(error);
        }
      };

      fetchAds();
    }
  }, [forceUpdateRequired]);

  const handleLanguageSelection = (lang) => {
    changeLanguage(lang);
    setLanguageIsVisible(false);
  };

  useEffect(() => {
    if (language && shuffledAds) {
      setModalVisible(shuffledAds.length > 0);
    }
  }, [shuffledAds]);

  useEffect(() => {
    if (isAllowed && modalVisible && shuffledAds.length > 0) {
      setCountdown(3);
      setIsButtonEnabled(false);

      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setIsButtonEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [isAllowed, modalVisible, shuffledAds]);

  const closeModal = async () => {
    setModalVisible(false);
  };

  const handleUpdatePress = () => {
    let url;
    if (Platform.OS === "ios") {
      url = "https://apps.apple.com/tm/app/arzan-al-market-taze/id6740143852";
    } else if (Platform.OS === "android") {
      url =
        "https://play.google.com/store/apps/details?id=com.alemtilsimat.arzanalstore";
    }

    if (url) {
      Linking.openURL(url);
    }
  };

  const handlePress = (banner) => {
    if (!banner?.link) {
      return;
    } else if (banner.categoryId === banner?.link) {
      router.navigate(`/categories/${banner.categoryId}`);
    } else if (banner.subCategoryId === banner?.link) {
      router.navigate(`/categories/subcategories/${banner.subCategoryId}`);
    } else if (banner.segmentId === banner?.link) {
      router.navigate(`/categories/subcategories/segments/${banner.segmentId}`);
    } else if (banner.productBarcode === banner?.link) {
      router.navigate(`/${banner.productBarcode}`);
    }
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={
          languageIsVisible && !modalShown && !language && !forceUpdateRequired
        }
      >
        <View className="bg-white flex-1 items-center justify-center px-8">
          <Image
            source={icons.logoNoText}
            contentFit="contain"
            className="h-52 w-52"
          />
          <CustomText
            classes="text-center text-lg text-dark-primary font-nbold mb-4"
            numberOfLines={2}
          >
            Добро пожаловать Arzan Al Market!
          </CustomText>
          <CustomText classes="text-base text-dark-primary font-nsemibold mb-2">
            Выберите язык
          </CustomText>
          <Pressable
            onPress={() => handleLanguageSelection("tm")}
            className="border border-grey-400 rounded-xl flex-row items-center mb-2 px-2 h-12 w-full"
          >
            <Image source={icons.turkmenistan} className="mr-2 h-10 w-10" />
            <CustomText classes="font-nsemibold text-base text-dark">
              Türkmen
            </CustomText>
          </Pressable>
          <Pressable
            onPress={() => handleLanguageSelection("ru")}
            className="border border-grey-400 rounded-xl flex-row items-center px-2 h-12 w-full"
          >
            <Image source={icons.russia} className="mr-2 h-10 w-10" />
            <CustomText classes="font-nsemibold text-base text-dark">
              Русский
            </CustomText>
          </Pressable>
        </View>
      </Modal>
      <Modal
        visible={
          isAllowed &&
          modalVisible &&
          shuffledAds.length > 0 &&
          noInternet === false &&
          !forceUpdateRequired
        }
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View className="bg-black/50 flex-1 justify-center items-center">
          <Pressable
            onPress={() => {
              handlePress(shuffledAds[0]);
              setModalVisible(false);
            }}
            className="border border-primary rounded-xl relative"
          >
            {isButtonEnabled ? (
              <Pressable
                onPress={closeModal}
                className="border border-primary rounded-full items-center justify-center absolute right-2 top-2 h-8 w-8 z-10"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-6 w-6"
                  tintColor="#ff9700"
                />
              </Pressable>
            ) : (
              <View className="border border-primary rounded-full items-center justify-center absolute right-2 top-2 h-8 w-8 z-10">
                <CustomText classes="text-primary text-lg">
                  {countdown}
                </CustomText>
              </View>
            )}
            <View className="rounded-xl relative h-[600px] w-[300px]">
              {shuffledAds[0] && (
                <Image
                  source={{ uri: `${apiURL}/${shuffledAds[0]?.image}` }}
                  contentFit="contain"
                  className="rounded-xl h-full w-full"
                />
              )}
            </View>
          </Pressable>
        </View>
      </Modal>
      <Modal
        visible={forceUpdateRequired && isAllowed}
        animationType="fade"
        transparent={true}
        statusBarTranslucent
      >
        <View className="bg-black/50 flex-1 items-center justify-center">
          <View className="bg-grey-50 dark:bg-dark-secondary border border-primary rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <CustomText classes="text-lg text-dark-primary dark:text-white font-nbold mb-2">
              {t.updateAvailable}
            </CustomText>
            <CustomText
              classes="text-base text-dark-primary dark:text-white text-center mb-4"
              numberOfLines={4}
            >
              {t.updateRequiredMessage}
            </CustomText>
            <Pressable
              onPress={handleUpdatePress}
              className="bg-primary rounded-xl flex-row items-center justify-center active:bg-primary-600 h-11 w-full"
            >
              <CustomText classes="font-nsemibold text-base text-white">
                {t.download}
              </CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
