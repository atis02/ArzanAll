import SearchBox from "../../../../../components/nav/SearchBox";
import ProductsFilter from "../../../../../components/nav/ProductsFilter";
import ProductContainerThree from "../../../../../components/containers/ProductContainer3";
import { icons } from "../../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../../utils/utils";
import { CustomText } from "../../../../../utils/CustomText";
import { useLanguageStore } from "../../../../../utils/useLanguageStore";
import { useState, useEffect, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  FlatList,
} from "react-native";
import { useColorScheme } from "nativewind";

const numColumns = 3;

const Button = ({ title, image, onPress }) => (
  <Pressable
    onPress={onPress}
    className="items-center justify-center mb-2 h-fit w-[25%]"
  >
    <View className="items-center h-fit">
      <View className="bg-grey-50 dark:bg-dark-accent rounded-xl items-center justify-center h-20 w-20">
        <Image
          source={image?.length > 0 ? `${apiURL}/${image}` : icons.logoNoText}
          contentFit="contain"
          className="h-14 w-14"
          tintColor={image?.length > 0 ? "" : "#a4a4a4"}
        />
      </View>
      <View className="h-12">
        <CustomText
          classes="font-nmedium text-center text-xs text-dark-accent dark:text-grey-200"
          numberOfLines={3}
        >
          {title}
        </CustomText>
      </View>
    </View>
  </Pressable>
);

export default function SubCategoryScreen() {
  const { id } = useLocalSearchParams();
  const [hasMore, setHasMore] = useState(true);
  const [sortValue, setSortValue] = useState(null);
  const [products, setProducts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const { language } = useLanguageStore();
  const { colorScheme } = useColorScheme();
  const [subCategoryData, setSubCategoryData] = useState(null);
  const [subCategoryLoading, setSubCategoryLoading] = useState(true);
  const [subCategoryError, setSubCategoryError] = useState(null);

  const fetchProducts = useCallback(
    async (sortValue, currentPage) => {
      try {
        const response = await fetch(`${apiURL}/products/client`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: currentPage,
            limit: 12,
            subCategoryId: id,
            sortBy: sortValue === null ? null : "currentSellPrice",
            order: sortValue,
          }),
        });
        const result = await response.json();
        const newProducts = result?.products || [];

        if (currentPage === 1) {
          setProducts(newProducts);
        } else {
          setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        }

        if (currentPage === result?.pagination?.totalPages) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [id]
  );

  const fetchSubCategoryData = useCallback(async () => {
    setSubCategoryLoading(true);
    setSubCategoryError(null);
    try {
      const response = await fetch(
        `${apiURL}/subcategories/fetch/client/${id}`
      );
      const data = await response.json();
      setSubCategoryData(data);
    } catch (error) {
      console.error("Error fetching subcategory data:", error);
      setSubCategoryError(error);
    } finally {
      setSubCategoryLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [id]);

  useEffect(() => {
    setIsRefreshing(true);
    fetchProducts(sortValue, page);
  }, [fetchProducts, sortValue, page]);

  useEffect(() => {
    fetchSubCategoryData();
  }, [fetchSubCategoryData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchProducts(sortValue, 1);
  }, [fetchProducts, sortValue]);

  const handleLoadMore = () => {
    if (hasMore && !isRefreshing) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleSortChange = (newSortValue) => {
    setSortValue(newSortValue);
    setPage(1);
  };

  if (subCategoryLoading)
    return (
      <View className="dark:bg-dark-primary items-center justify-center h-full">
        <LoadingLarge />
      </View>
    );

  if (subCategoryError) return <></>;

  const { nameTm, nameRu, Segments } = subCategoryData || {};

  const renderItem = ({ item }) => (
    <View className="px-1 w-1/3">
      <ProductContainerThree productData={item} />
    </View>
  );

  return (
    <View className="bg-white dark:bg-dark-primary px-4 h-full">
      <View className="flex-row items-center my-2">
        <Pressable
          onPress={() => router.back()}
          className="bg-grey-50 dark:bg-dark-accent rounded-full items-center justify-center active:bg-grey-200 dark:active:bg-dark-accent/50 mr-2 h-10 w-10"
        >
          <Image
            source={icons.back}
            contentFit="contain"
            className="h-6 w-6"
            tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
          />
        </Pressable>
        <View className="justify-center items-start">
          <CustomText
            classes="font-nbold text-primary text-base w-72"
            numberOfLines={2}
          >
            {language === "tm" ? nameTm : nameRu}
          </CustomText>
        </View>
      </View>
      {Segments?.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex-row flex-wrap items-center mt-2 h-fit w-full">
            {Segments.map((item) => (
              <Button
                onPress={() =>
                  router.navigate(
                    `/categories/subcategories/segments/${item.id}`
                  )
                }
                image={item?.image}
                title={language === "tm" ? item?.nameTm : item?.nameRu}
                key={item.id}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
              <ProductsFilter onSortChange={handleSortChange} />
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={<View className="mb-4"></View>}
        />
      )}
    </View>
  );
}
