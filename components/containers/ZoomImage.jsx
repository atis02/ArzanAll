import { icons } from "../../utils/icons";
import { Image } from "expo-image";
import { StyleSheet, Dimensions, Pressable } from "react-native";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const ZoomImage = ({ imageUrl, onPress }) => {
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const handleGesture = (event) => {
    scale.value = event.scale;
    focalX.value = event.focalX;
    focalY.value = event.focalY;
  };

  const handleGestureEnd = () => {
    scale.value = withSpring(1);
    focalX.value = withSpring(0);
    focalY.value = withSpring(0);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: focalX.value - width / 2 },
        { translateY: focalY.value - height / 2 },
        { scale: scale.value },
        { translateX: -(focalX.value - width / 2) },
        { translateY: -(focalY.value - height / 2) },
      ],
    };
  });

  return (
    <GestureHandlerRootView className="bg-white">
      <PinchGestureHandler
        onGestureEvent={(event) => handleGesture(event.nativeEvent)}
        onEnded={handleGestureEnd}
      >
        <Animated.View style={{ flex: 1 }} className="relative">
          <Pressable
            onPress={onPress}
            className="bg-grey-600 rounded-xl flex-row items-center justify-center active:opacity-70 absolute right-0 top-16 h-10 w-10 z-10"
          >
            <Image
              source={icons.cross}
              contentFit="contain"
              className="h-5 w-5"
              tintColor="#ffffff"
            />
          </Pressable>
          <Animated.Image
            source={{ uri: imageUrl }}
            style={[styles.image, animatedStyle]}
            resizeMode="contain"
          />
        </Animated.View>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: width - 32,
    height: height,
  },
});

export default ZoomImage;
