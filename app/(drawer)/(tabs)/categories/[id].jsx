import SearchBox from "../../../../components/nav/SearchBox";
import ProductsFilter from "../../../../components/nav/ProductsFilter";
import ProductContainerThree from "../../../../components/containers/ProductContainer3";
import { icons } from "../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useLanguageStore } from "../../../../utils/useLanguageStore";
import { useState, useEffect, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "nativewind";

const numColumns = 3;

const Button = ({ title, image, onPress }) => {
  return (
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
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortValue, setSortValue] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const [categoryData, setCategoryData] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  const fetchProducts = useCallback(
    async (sortValue, currentPage) => {
      if (currentPage === 1) {
        setInitialLoading(true);
      }
      setIsRefreshing(currentPage !== 1);

      try {
        const response = await fetch(`${apiURL}/products/client`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: currentPage,
            limit: 12,
            categoryId: id,
            sortBy: sortValue === null ? null : "currentSellPrice",
            order: sortValue,
          }),
        });
        const result = await response.json();
        const newProducts = result?.products || [];

        if (currentPage === 1) {
          setData(newProducts);
        } else {
          setData((prevData) => [...prevData, ...newProducts]);
        }

        if (currentPage === result?.pagination?.totalPages) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (currentPage === 1) {
          setInitialLoading(false);
        }
        setIsRefreshing(false);
      }
    },
    [id]
  );

  const fetchCategoryData = useCallback(async () => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const response = await fetch(`${apiURL}/categories/fetch/client/${id}`);
      const data = await response.json();
      setCategoryData(data);
    } catch (error) {
      console.error("Error fetching category data:", error);
      setCategoryError(error);
    } finally {
      setCategoryLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setData([]);
    setPage(1);
  }, [id]);

  useEffect(() => {
    setIsRefreshing(true);
    fetchProducts(sortValue, page);
  }, [fetchProducts, sortValue, page]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

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

  if (categoryLoading)
    return (
      <View className="dark:bg-dark-primary items-center justify-center h-full">
        <LoadingLarge />
      </View>
    );

  if (categoryError) return <></>;

  const { nameTm, nameRu, SubCategories, deliveryPrice } = categoryData || {};

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
      {id === "6518dba0-f9c4-4264-9fa9-4f37c49ca328" ? (
        <CustomText classes="dark:text-grey-200 font-nsemibold my-1 px-2">
          {t.forThisCategory} : {deliveryPrice} M
        </CustomText>
      ) : null}
      {SubCategories?.length > 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          className="space-y-2 mt-2"
        >
          <View className="flex-row flex-wrap items-center h-fit w-full">
            {SubCategories.map((item) => (
              <Button
                onPress={() =>
                  router.navigate(`/categories/subcategories/${item.id}`)
                }
                image={item?.image}
                title={language === "tm" ? item?.nameTm : item?.nameRu}
                key={item.id}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <>
          {initialLoading ? (
            <ActivityIndicator
              size="large"
              color="#ff9700"
              style={{ marginTop: "50%" }}
            />
          ) : (
            <FlatList
              data={data}
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
                marginTop: 8,
              }}
              ListHeaderComponent={
                <View className="mb-2">
                  <SearchBox />
                  <ProductsFilter onSortChange={handleSortChange} />
                </View>
              }
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                />
              }
              ListFooterComponent={<View className="mb-4"></View>}
            />
          )}
        </>
      )}
    </View>
  );
}
