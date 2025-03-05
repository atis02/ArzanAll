import { icons } from "../../utils/icons";
import ProductContainer from "./ProductContainer";
import { apiURL, LoadingLarge } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useColorScheme } from "nativewind";

export default function PopularProductsBox({ isRefreshing }) {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiURL}/products/popular`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: 1,
          limit: 20,
        }),
      });
      const data = await response.json();
      setData(data?.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isRefreshing]);

  return (
    <>
      {data?.length > 0 ? (
        <>
          <View className="w-full">
            <View className="flex-row items-center justify-between h-10 w-full">
              <CustomText classes="text-lg text-primary font-nbold">
                {t.popularProducts}
              </CustomText>
              <CustomText
                onPress={() => router.navigate("/popular")}
                classes="text-dark-primary dark:text-grey-200 active:opacity-50"
              >
                {t.showAll}
              </CustomText>
            </View>
            <View>
              {isLoading ? (
                <View className="justify-center items-center h-28">
                  <LoadingLarge />
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    alignItems: "center",
                  }}
                  className="flex-row"
                >
                  {data?.map((item) => {
                    return (
                      <ProductContainer key={item.barcode} productData={item} />
                    );
                  })}
                  <Pressable
                    onPress={() => router.navigate("/popular")}
                    className="flex-row items-center justify-center active:opacity-50 h-10 w-[152px]"
                  >
                    <CustomText classes="text-dark-primary dark:text-grey-200 mr-2">
                      {t.showAll}
                    </CustomText>
                    <Image
                      source={icons.forward}
                      contentFit="contain"
                      className="h-5 w-5"
                      transition={100}
                      tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
                    />
                  </Pressable>
                </ScrollView>
              )}
            </View>
          </View>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
