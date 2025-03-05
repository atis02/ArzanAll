import { View, ActivityIndicator } from "react-native";

export const LoadingSmall = () => {
  return (
    <View className="mt-8">
      <ActivityIndicator color="#ff9700" size="small" />
    </View>
  );
};

export const LoadingLarge = () => {
  return (
    <View className="mt-8">
      <ActivityIndicator color="#ff9700" size="large" />
    </View>
  );
};

export const apiURL = "https://arzanal.alemtilsimat.com/api";

export const checkInternetConnectivity = async () => {
  try {
    const response = await fetch("https://arzanal.alemtilsimat.com/api", {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
