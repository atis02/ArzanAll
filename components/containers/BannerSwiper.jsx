import Carousel from "react-native-reanimated-carousel";
import { apiURL, LoadingLarge } from "../../utils/utils";
import { useFetcher } from "../../utils/useFetcher";
import { useEffect } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Dimensions, Pressable } from "react-native";

const screenWidth = Dimensions.get("screen").width;

export default function BannerSwiper({ isRefreshing }) {
  const {
    data: response = [],
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/banners/active`);

  useEffect(() => {
    if (isRefreshing) {
      mutate();
    }
  }, [isRefreshing]);

  if (isLoading) {
    return (
      <View className="items-center justify-center mt-2 h-[190px] w-full">
        <LoadingLarge />
      </View>
    );
  }

  if (error) return <></>;

  const banners = response?.banners || [];

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
    <View className="rounded-xl items-center justify-center h-fit w-full">
      <Carousel
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        loop={banners?.length > 1 ? true : false}
        height={190}
        width={screenWidth - 32}
        autoPlay={true}
        autoPlayInterval={5000}
        scrollAnimationDuration={500}
        data={banners}
        snapEnabled={true}
        defaultIndex={0}
        renderItem={({ index }) => (
          <Pressable onPress={() => handlePress(banners[index])}>
            <Image
              source={{
                uri: `${apiURL}/${banners[index]?.image}`,
              }}
              contentFit="cover"
              className="border border-grey-200 rounded-xl h-full w-full"
            />
          </Pressable>
        )}
      />
    </View>
  );
}
