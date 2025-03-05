import SearchBox from "../../../../components/nav/SearchBox";
import ProductsFilter from "../../../../components/nav/ProductsFilter";
import ProductContainerThree from "../../../../components/containers/ProductContainer3";
import { icons } from "../../../../utils/icons";
import { apiURL } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useLanguageStore } from "../../../../utils/useLanguageStore";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
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

export default function SearchScreen() {
  const { searchquery } = useLocalSearchParams();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sortValue, setSortValue] = useState(null);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const fetchData = async (query, currentPage, sortValue) => {
    if (currentPage === 1) {
      setInitialLoading(true);
      setProducts([]);
    }

    setRefreshing(currentPage !== 1);

    try {
      const response = await fetch(`${apiURL}/products/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          page: currentPage,
          limit: 10,
          sortBy: sortValue === null ? null : "currentSellPrice",
          order: sortValue,
        }),
      });

      const result = await response.json();

      if (result?.products) {
        if (currentPage === 1) {
          setProducts(result.products);
        } else {
          const combinedProducts = [...products, ...result.products];
          const uniqueProducts = Array.from(
            new Set(combinedProducts.map((product) => product.barcode))
          ).map((barcode) =>
            combinedProducts.find((product) => product.barcode === barcode)
          );
          setProducts(uniqueProducts);
        }

        setHasMore(result.products.length === 10);
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
  }, [searchquery]);

  useEffect(() => {
    fetchData(searchquery, page, sortValue);
  }, [searchquery, page, sortValue]);

  const handleLoadMore = () => {
    if (hasMore && !refreshing) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchData(searchquery, 1, sortValue);
  };

  const handleSortChange = (newSortValue) => {
    setSortValue(newSortValue);
    setPage(1);
  };

  const renderItem = ({ item }) => (
    <View className="px-1 w-1/3">
      <ProductContainerThree productData={item} />
    </View>
  );

  return (
    <View className="bg-white dark:bg-dark-primary px-4 h-full">
      <View className="flex-row items-center mt-2">
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
            {t.search}
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
          {products.length > 0 ? (
            <>
              <CustomText
                classes="text-base dark:text-grey-200 mb-2 h-fit w-fit"
                numberOfLines={2}
              >
                {t.searchResults}
                <CustomText classes="text-base dark:text-grey-200 font-nbold">
                  {searchquery}
                </CustomText>
              </CustomText>
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
                  gap: 2,
                  marginTop: 8,
                }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View className="mb-2">
                    <SearchBox />
                    <ProductsFilter onSortChange={handleSortChange} />
                  </View>
                }
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                ListFooterComponent={<View className="mb-2"></View>}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                }
              />
            </>
          ) : (
            <CustomText
              classes="text-base dark:text-grey-200 mt-2 h-14 w-fit"
              numberOfLines={2}
            >
              {t.noSearchResults}
              <CustomText classes="font-nbold text-dark-accent dark:text-grey-200">
                {searchquery}
              </CustomText>
            </CustomText>
          )}
        </>
      )}
    </View>
  );
}
