import SearchBox from "../../../components/nav/SearchBox";
import ProductContainerThree from "../../../components/containers/ProductContainer3";
import { icons } from "../../../utils/icons";
import { apiURL } from "../../../utils/utils";
import { CustomText } from "../../../utils/CustomText";
import { useLanguageStore } from "../../../utils/useLanguageStore";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "nativewind";

const numColumns = 3;

export default function PopularProductsScreen() {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const fetchProducts = async (currentPage) => {
    if (currentPage === 1) {
      setInitialLoading(true);
      setProducts([]);
    }

    setRefreshing(currentPage !== 1);

    try {
      const response = await fetch(`${apiURL}/products/popular`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: currentPage,
          limit: 12,
        }),
      });

      const result = await response.json();

      if (result?.products) {
        if (currentPage === 1) {
          setProducts(result?.products || []);
        } else {
          const combinedProducts = [...products, ...(result?.products || [])];
          const uniqueProducts = Array.from(
            new Set(combinedProducts.map((product) => product?.barcode))
          ).map((id) =>
            combinedProducts.find((product) => product?.barcode === id)
          );

          setProducts(uniqueProducts);
        }

        if (currentPage === result?.pagination?.totalPages) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (currentPage === 1) {
        setInitialLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore && !refreshing) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchProducts(1);
  };

  const renderItem = ({ item }) => (
    <View className="px-1 w-1/3">
      <ProductContainerThree productData={item} />
    </View>
  );

  return (
    <View className="bg-white dark:bg-dark-primary pt-2 px-4 h-full">
      <View className="flex-row items-center mb-2">
        <Pressable
          onPress={() => router.back()}
          className="bg-grey-50 dark:bg-dark-accent rounded-full items-center justify-center active:bg-grey-200 mr-2 h-10 w-10"
        >
          <Image
            source={icons.back}
            contentFit="contain"
            className="h-6 w-6"
            tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
          />
        </Pressable>
        <View className="justify-center items-start">
          <CustomText classes="font-nbold text-primary text-lg">
            {t.popularProducts}
          </CustomText>
        </View>
      </View>
      {initialLoading ? (
        <ActivityIndicator
          size="large"
          color="#ff9700"
          style={{ marginTop: "50%" }}
        />
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.barcode}
            numColumns={numColumns}
            key={numColumns}
            onEndReached={handleLoadMore}
            windowSize={8}
            initialNumToRender={6}
            initialListSize={6}
            maxToRenderPerBatch={8}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{
              backgroundColor: colorScheme === "dark" ? "#1b1c1d" : "#ffffff",
              gap: 2,
            }}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListHeaderComponent={
              <View className="pb-2">
                <SearchBox />
              </View>
            }
            ListFooterComponent={<View className="mb-4"></View>}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        </>
      )}
    </View>
  );
}
