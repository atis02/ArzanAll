import { icons } from "../../utils/icons";
import { apiURL } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { AddToCart } from "../functions/AddToCart";
import { AddToWishlistBox } from "../functions/AddToWishlistBox";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Pressable } from "react-native";

export default function ProductContainer({ productData }) {
  const { language } = useLanguageStore();
  const imageUrl = productData.imageOne
    ? `${apiURL}/${productData.imageOne}`
    : null;

  return (
    <>
      <Pressable
        onPress={() => router.navigate(`/${productData.barcode}`)}
        className="bg-grey-50 dark:bg-dark-accent border border-grey-100 dark:border-transparent rounded-xl p-1 mr-2 w-[152px]"
      >
        <View className="rounded-xl flex flex-col h-fit">
          <View className="relative">
            <View className="bg-white border border-grey-200 dark:border-transparent rounded-xl h-44">
              <Image
                source={imageUrl || icons.placeholder}
                contentFit="contain"
                className="rounded-xl h-40"
                placeholder={icons.placeholder}
                placeholderContentFit="cover"
              />
            </View>
            <AddToWishlistBox product={productData} />
            {productData?.Status?.id === 2 ? (
              <View className="bg-primary rounded-tl-xl rounded-br-xl flex-row items-center justify-center absolute px-2 h-6">
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
            ) : (
              <></>
            )}
          </View>
          <View>
            <View className="items-center mt-1 h-12 w-full">
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
                <View className="flex-row items-center justify-between dark:px-1 w-full">
                  <>
                    <CustomText classes="text-base text-primary font-nbold">
                      {parseFloat(productData.currentSellPrice).toFixed(2)} M
                    </CustomText>
                    <CustomText classes="text-xs text-grey-400 font-nbold line-through">
                      {parseFloat(productData.sellPrice).toFixed(2)} M
                    </CustomText>
                  </>
                </View>
              ) : (
                <View className="flex-row items-center justify-center w-full">
                  <CustomText classes="text-base text-primary font-nbold">
                    {parseFloat(productData?.currentSellPrice).toFixed(2)} M
                  </CustomText>
                </View>
              )}
            </>
            <View className="flex-row items-center h-10 w-full">
              <AddToCart product={productData} />
            </View>
          </View>
        </View>
      </Pressable>
    </>
  );
}
