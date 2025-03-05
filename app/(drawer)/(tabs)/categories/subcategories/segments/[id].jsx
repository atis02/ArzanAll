import SearchBox from "../../../../../../components/nav/SearchBox";
import ProductsFilter from "../../../../../../components/nav/ProductsFilter";
import ProductContainerThree from "../../../../../../components/containers/ProductContainer3";
import { icons } from "../../../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../../../utils/utils";
import { CustomText } from "../../../../../../utils/CustomText";
import { useLanguageStore } from "../../../../../../utils/useLanguageStore";
import { useState, useEffect, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { View, RefreshControl, Pressable, FlatList } from "react-native";
import { useColorScheme } from "nativewind";

const numColumns = 3;

export default function SegmentPage() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortValue, setSortValue] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [segmentData, setSegmentData] = useState(null);
  const [segmentLoading, setSegmentLoading] = useState(true);
  const [segmentError, setSegmentError] = useState(null);

  const { language } = useLanguageStore();
  const { colorScheme } = useColorScheme();

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
            segmentId: id,
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
        setIsRefreshing(false);
      }
    },
    [id]
  );

  const fetchSegmentData = useCallback(async () => {
    setSegmentLoading(true);
    setSegmentError(null);
    try {
      const response = await fetch(`${apiURL}/segments/fetch/client/${id}`);
      const data = await response.json();
      setSegmentData(data);
    } catch (error) {
      console.error("Error fetching segment data:", error);
      setSegmentError(error);
    } finally {
      setSegmentLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setPage(1);
    setData([]);
  }, [id]);

  useEffect(() => {
    setIsRefreshing(true);
    fetchProducts(sortValue, page);
  }, [fetchProducts, sortValue, page]);

  useEffect(() => {
    fetchSegmentData();
  }, [fetchSegmentData]);

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

  if (segmentLoading)
    return (
      <View className="dark:bg-dark-primary items-center justify-center h-full">
        <LoadingLarge />
      </View>
    );

  if (segmentError) return <></>;

  const { nameTm, nameRu } = segmentData || {};

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
    </View>
  );
}
