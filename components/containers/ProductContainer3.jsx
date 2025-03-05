import { icons } from "../../utils/icons";
import { apiURL } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { AddToCartThree } from "../functions/AddToCartThree";
import { AddToWishlistThree } from "../functions/AddToWishlist3";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Pressable } from "react-native";
import { useColorScheme } from "nativewind";

export default function ProductContainerThree({ productData }) {
  const { language } = useLanguageStore();
  const colorScheme = useColorScheme();
  const imageUrl = productData.imageOne
    ? `${apiURL}/${productData.imageOne}`
    : null;

  return (
    <>
      <Pressable
        onPress={() => router.navigate(`/${productData.barcode}`)}
        className="bg-white dark:bg-dark-accent rounded-xl w-full"
      >
        <View className="rounded-xl flex flex-col h-fit">
          <View className="relative">
            <View className="border border-grey-200 dark:border-grey-700 rounded-xl">
              <Image
                source={imageUrl || icons.placeholder}
                contentFit="cover"
                className="bg-white dark:bg-dark-accent rounded-xl h-32"
                placeholder={icons.placeholder}
                placeholderContentFit="cover"
              />
            </View>
            <AddToWishlistThree product={productData} />
            {productData?.Status?.id === 1 ||
            productData?.Status?.id === undefined ? (
              <></>
            ) : (
              <View className="bg-primary rounded-tl-xl rounded-br-xl flex-row items-center justify-center absolute px-1 h-5">
                <CustomText classes="text-xs text-white font-nitalic">
                  {productData?.Status?.id === 1 ? (
                    <></>
                  ) : language === "tm" ? (
                    productData?.Status?.nameTm
                  ) : (
                    productData?.Status?.nameRu
                  )}
                </CustomText>
              </View>
            )}
          </View>
          <View>
            <View className="items-center justify-center h-12 w-full">
              <CustomText
                classes="text-xs text-center text-dark-primary dark:text-white font-nsemibold"
                numberOfLines={3}
              >
                {language === "tm" ? productData?.nameTm : productData?.nameRu}
              </CustomText>
            </View>
            <>
              {productData?.discountValue &&
              parseFloat(productData.discountValue) > 0 ? (
                <View className="flex-row items-center justify-between dark:px-[2px] h-6 w-full">
                  <>
                    <CustomText classes="text-xs text-primary font-nbold">
                      {parseFloat(productData.currentSellPrice).toFixed(2)}
                    </CustomText>
                    <CustomText classes="text-xs text-grey-400 font-nbold line-through">
                      {parseFloat(productData.sellPrice).toFixed(1)}
                    </CustomText>
                  </>
                </View>
              ) : (
                <View className="flex-row items-center justify-center h-6 w-full">
                  <CustomText classes="text-sm text-primary font-nbold">
                    {parseFloat(productData?.currentSellPrice).toFixed(2)} M
                  </CustomText>
                </View>
              )}
            </>
            <Pressable
              onPress={undefined}
              className="flex-row items-center h-9 w-full"
            >
              <AddToCartThree product={productData} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </>
  );
}
