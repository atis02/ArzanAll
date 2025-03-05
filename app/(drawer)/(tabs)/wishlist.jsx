import { icons } from "../../../utils/icons";
import ProductContainerThree from "../../../components/containers/ProductContainer3";
import SearchBox from "../../../components/nav/SearchBox";
import { useUnregCustomerStore } from "../../../utils/useUnregCustomerStore";
import { useLanguageStore } from "../../../utils/useLanguageStore";
import { CustomText } from "../../../utils/CustomText";
import { Image } from "expo-image";
import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useColorScheme } from "nativewind";

export default function WishlistScreen() {
  const [isWishList, setIsWishList] = useState(1);
  const { wishlist, waitlist, cleanWaitList } = useUnregCustomerStore();
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const array = [
    {
      id: 1,
      text: t.wishlist,
      icon: icons.heartFill,
    },
    {
      id: 2,
      text: t.waitList,
      icon: icons.sandtime,
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-white dark:bg-dark-primary py-2 px-4 h-full"
    >
      <View className="bg-grey-50 dark:bg-dark-accent rounded-xl flex-row items-center justify-between">
        {array?.map((item) => (
          <View className="w-1/2" key={item?.id}>
            <Pressable
              onPress={() => {
                setIsWishList(item?.id);
              }}
              className={`flex flex-row justify-center items-center px-2 h-11 w-full ${
                isWishList === item?.id ? "bg-primary" : ""
              } ${
                item.id === 1
                  ? "rounded-l-xl border-r-0"
                  : "rounded-r-xl border-l-0"
              }`}
            >
              <CustomText
                classes={`font-nsemibold text-center ${
                  isWishList === item?.id
                    ? "text-white"
                    : "text-dark-accent dark:text-grey-200"
                }`}
              >
                {item?.text}
              </CustomText>
              <Image
                source={item.icon}
                contentFit="contain"
                className="ml-1 h-4 w-4"
                tintColor={
                  isWishList === item?.id
                    ? "#ffffff"
                    : colorScheme === "light"
                    ? "#1b1c1d"
                    : "#dfdfdf"
                }
              />
            </Pressable>
          </View>
        ))}
      </View>
      <View className="mt-2">
        <SearchBox />
      </View>
      <>
        {isWishList === 1 ? (
          <>
            {wishlist?.length > 0 ? (
              <View className="mt-4">
                <View className="flex-row flex-wrap items-center gap-2">
                  {wishlist?.map((product) => {
                    return (
                      <View key={product.barcode} className="w-[31%]">
                        <ProductContainerThree productData={product} />
                      </View>
                    );
                  })}
                </View>
                <View className="mb-4"></View>
              </View>
            ) : (
              <CustomText
                classes="text-base text-dark-accent dark:text-grey-200 mt-2"
                numberOfLines={2}
              >
                {t.addToWishlist}
              </CustomText>
            )}
          </>
        ) : (
          <>
            {waitlist?.length > 0 ? (
              <View className="flex-row flex-wrap items-center mt-2 mb-4">
                {waitlist?.map((product) => {
                  return (
                    <View key={product.barcode} className="mb-2 mr-1 w-[31%]">
                      <ProductContainerThree productData={product} />
                    </View>
                  );
                })}
              </View>
            ) : (
              <CustomText
                classes="text-base text-dark-accent dark:text-grey-200 mt-2"
                numberOfLines={2}
              >
                {t.waitListInfo}
              </CustomText>
            )}
          </>
        )}
      </>
    </ScrollView>
  );
}
