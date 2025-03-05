import { icons } from "./icons";
import { CustomText } from "./CustomText";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Modal, View, Pressable } from "react-native";
import { checkInternetConnectivity } from "./utils";

export default function NoInternetModal({ visible, setIsConnected }) {
  const handleRetry = async () => {
    const isConnected = await checkInternetConnectivity();
    if (isConnected) {
      setIsConnected(true);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      style={{ zIndex: 10 }}
      statusBarTranslucent
    >
      <View className="bg-white flex-1 justify-center items-center">
        <View className="items-center p-2 h-auto w-[300px]">
          <Image
            source={icons.cloud}
            contentFit="contain"
            className="mb-4 h-16 w-16"
            tintColor="#ff9700"
          />
          <CustomText classes="text-center mb-4" numberOfLines={3}>
            Internet näsazlygy. Internediňizi täzeden barlaň.
          </CustomText>
          <Pressable
            className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 px-4 h-12"
            onPress={handleRetry}
          >
            <CustomText classes="text-white text-base">
              Täzeden synanyş
            </CustomText>
          </Pressable>
        </View>
      </View>
      <StatusBar backgroundColor="#ffffff" style="dark" />
    </Modal>
  );
}
