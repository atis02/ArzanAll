import * as SplashScreen from "expo-splash-screen";
import NoInternetModal from "../utils/NoInternetModal";
import StartUpModal from "../components/containers/StartUpModal";
import { useConnectivity } from "../utils/useConnectivity";
import { usePushNotifications } from "../utils/usePushNotifications";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useState, useEffect } from "react";
import { NativeWindStyleSheet } from "nativewind";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

NativeWindStyleSheet.setOutput({
  default: "native",
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "OpenSans-Regular": require("../assets/fonts/regular.ttf"),
    "OpenSans-Medium": require("../assets/fonts/medium.ttf"),
    "OpenSans-SemiBold": require("../assets/fonts/semibold.ttf"),
    "OpenSans-Bold": require("../assets/fonts/bold.ttf"),
    "OpenSans-Italic": require("../assets/fonts/italic.ttf"),
  });
  const [internetModal, setInternetModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [allowModal, setAllowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const { notification } = usePushNotifications();
  const isOnline = useConnectivity();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (fontsLoaded || error) {
        SplashScreen.hideAsync().then(() => {
          if (isOnline && isConnected) {
            setModalVisible(true);
            setAllowModal(true);
          }
        });
      }
    }, 3000);

    if (!isOnline || !isConnected) {
      setInternetModal(true);
    } else {
      setInternetModal(false);
    }

    return () => clearTimeout(timeout);
  }, [fontsLoaded, error, isOnline, isConnected]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <RootSiblingParent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          </Stack>
          <NoInternetModal
            visible={internetModal}
            setIsConnected={setIsConnected}
          />
          <StartUpModal
            languageIsVisible={modalVisible}
            setLanguageIsVisible={setModalVisible}
            isAllowed={allowModal}
            noInternet={internetModal}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </RootSiblingParent>
  );
}
