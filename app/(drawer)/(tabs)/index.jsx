import BannerSwiper from "../../../components/containers/BannerSwiper";
import SearchBox from "../../../components/nav/SearchBox";
import CategoriesBox from "../../../components/containers/CategoriesBox";
import NewProductsBox from "../../../components/containers/NewProductsBox";
import SaleProductsBox from "../../../components/containers/SaleProducts";
import PopularProductsBox from "../../../components/containers/PopularProductBox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { icons } from "../../../utils/icons";
import { apiURL } from "../../../utils/utils";
import { CustomText } from "../../../utils/CustomText";
import { useLanguageStore } from "../../../utils/useLanguageStore";
import { useCustomerStore } from "../../../utils/useCustomerStore";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { useColorScheme } from "nativewind";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewIsLoading, setReviewIsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const { getTranslations } = useLanguageStore();
  const { useCustomerData } = useCustomerStore();
  const { colorScheme } = useColorScheme();
  const t = getTranslations();

  const fetchReviews = async () => {
    setRefreshing(true);

    try {
      const response = await fetch(`${apiURL}/actions/market/active`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: 1,
          limit: 10,
        }),
      });
      const data = await response.json();
      setReviewsData(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    fetchReviews();
  };

  useEffect(() => {
    const sendVisitorRequest = async () => {
      try {
        const lastVisitDate = await AsyncStorage.getItem("lastVisitDate");
        const today = new Date().toISOString().split("T")[0];

        if (lastVisitDate === today) {
          await fetch(`${apiURL}/visitor/new`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ boolean: false }),
          });
        } else {
          await fetch(`${apiURL}/visitor/new`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ boolean: true }),
          });

          await AsyncStorage.setItem("lastVisitDate", today);
        }
      } catch (error) {
        console.error(error);
      }
    };

    sendVisitorRequest();
    fetchReviews();
  }, []);

  const canReview = async () => {
    if (!useCustomerData?.id) {
      Alert.alert(t.canNotLeaveReviewHeader, t.signInOrUpForReview);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${apiURL}/actions/review/market`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: useCustomerData?.id,
        }),
      });
      const data = await response.json();

      if (data?.canReviewMarket === false) {
        Alert.alert(t.canNotLeaveReviewHeader, t.buySomethingBeforeReview);
        return;
      } else {
        setReviewModal(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMarketReview = async () => {
    if (reviewText?.length < 5) {
      Alert.alert(t.fillFields, t.makeReviewLonger);
      return;
    }

    try {
      setReviewIsLoading(true);

      const response = await fetch(`${apiURL}/actions/market/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: useCustomerData?.id,
          ReviewType: "MARKET",
          rating: Number(rating),
          comment: reviewText,
        }),
      });

      if (response.ok) {
        Alert.alert(t.success, t.reviewIsProcessing);
        setReviewModal(false);
        setReviewText("");
        setRating(5);
        return;
      } else {
        Alert.alert(t.error, t.networkError);
        return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setReviewIsLoading(false);
    }
  };

  const handleRatingPress = (index) => {
    setRating(index + 1);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-white dark:bg-dark-primary py-2 px-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <BannerSwiper />
      <View className="mt-2">
        <SearchBox />
      </View>
      <CategoriesBox isRefreshing={refreshing} />
      <NewProductsBox isRefreshing={refreshing} />
      <SaleProductsBox isRefreshing={refreshing} />
      <PopularProductsBox isRefreshing={refreshing} />
      <View className="w-full">
        <View className="items-center mb-2">
          <View className="flex-row items-center justify-between h-12 w-full">
            <CustomText classes="text-lg text-primary font-nbold">
              {t.marketReviews}
            </CustomText>
            <CustomText
              onPress={() => router.navigate("/reviews")}
              classes="text-dark-primary dark:text-grey-200 active:opacity-50"
            >
              {t.showAll}
            </CustomText>
          </View>
          <View className="flex-row items-center justify-between mb-1 h-9 w-full">
            <View className="bg-grey-50 dark:bg-dark-accent rounded-xl flex-row items-center justify-center h-9 w-[50%]">
              <Image
                source={icons.star}
                contentFit="contain"
                className="mr-1 h-4 w-4"
                tintColor="#ff9700"
              />
              <CustomText classes="text-dark-primary dark:text-white">
                {t.averageRating} :
              </CustomText>
              <CustomText classes="text-primary text-base font-nbold">
                {" "}
                {reviewsData?.averageRating}
              </CustomText>
            </View>
            <Pressable
              onPress={() => canReview()}
              className="bg-primary rounded-xl flex-row items-center justify-center active:bg-primary-600 h-9 w-[40%]"
            >
              <View>
                {isLoading ? (
                  <ActivityIndicator
                    color="#ffffff"
                    size="small"
                    className="mr-1"
                  />
                ) : (
                  <></>
                )}
              </View>
              <CustomText classes="text-white">{t.leaveReview}</CustomText>
            </Pressable>
          </View>
        </View>
        {reviewsData?.reviews?.map((item) => {
          return (
            <View
              key={item.id}
              className="bg-grey-50 dark:bg-dark-accent border border-grey-200 dark:border-transparent rounded-xl mb-2 p-2 w-full"
            >
              <>
                <View className="flex-row items-center mb-2">
                  <View className="bg-grey-100 border border-grey-200 rounded-xl justify-center items-center h-8 w-8">
                    <Image
                      source={icons.user}
                      contentFit="contain"
                      className="h-4 w-4"
                    />
                  </View>
                  <CustomText classes="text-dark-primary dark:text-grey-200 ml-2">
                    {item?.Customer?.username
                      ? item?.Customer?.username
                      : t.anonymous}
                  </CustomText>
                  <View className="flex-row items-center ml-auto">
                    {Array.from({ length: item.rating }).map((_, index) => (
                      <Image
                        key={index}
                        source={icons.star}
                        contentFit="contain"
                        className="h-4 w-4 mr-1"
                        tintColor="#fdda0d"
                      />
                    ))}
                  </View>
                </View>
                <CustomText
                  classes="font-nsemibold text-dark-primary dark:text-grey-200 text-left"
                  numberOfLines={40}
                >
                  {item.comment}
                </CustomText>
                <CustomText classes="border-b border-grey-200 dark:border-grey-700 text-dark-primary dark:text-grey-200 text-right text-xs mt-1 pb-1">
                  {item.createdAt}
                </CustomText>
              </>
              <>
                {item?.reply ? (
                  <>
                    <View className="flex-row items-center ml-auto mt-1">
                      <View className="flex-row items-center justify-between grow">
                        <CustomText classes="text-dark-primary dark:text-grey-200 text-xs text-right mt-1 pb-1">
                          {item.updatedAt}
                        </CustomText>
                        <CustomText classes="text-dark-primary dark:text-grey-200 mr-2">
                          {t.administration}
                        </CustomText>
                      </View>
                      <View className="bg-grey-100 border border-grey-200 rounded-xl justify-center items-center h-8 w-8">
                        <Image
                          source={icons.logoNoText}
                          contentFit="contain"
                          className="h-5 w-5"
                        />
                      </View>
                    </View>
                    <CustomText
                      classes="font-nsemibold text-dark-primary dark:text-grey-200 text-right"
                      numberOfLines={20}
                    >
                      {item.reply}
                    </CustomText>
                  </>
                ) : (
                  <></>
                )}
              </>
            </View>
          );
        })}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={reviewModal}
        onRequestClose={() => setReviewModal(false)}
      >
        <View className="bg-white/50 dark:bg-dark/50 flex-1 z-10">
          <View className="bg-grey-50 dark:bg-dark-accent border border-grey-200 dark:border-grey-700 rounded-t-3xl relative p-4 mt-auto min-h-[70%] w-full">
            <View className="flex-row items-center justify-between mb-4">
              <CustomText classes="text-base text-primary font-nbold">
                {t.leaveReview}
              </CustomText>
              <Pressable
                onPress={() => {
                  setReviewModal(false);
                }}
                className="bg-white dark:bg-dark-primary border border-grey-400 dark:border-grey-200 rounded-xl items-center justify-center active:border-primary h-9 w-9"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-5 w-5"
                  tintColor={colorScheme === "dark" ? "#e7e5ef" : "#a4a4a4"}
                />
              </Pressable>
            </View>
            <View className="items-center">
              <View className="flex-row items-center justify-around h-14 w-72">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleRatingPress(index)}
                  >
                    <Image
                      source={icons.star}
                      contentFit="contain"
                      className="h-7 w-7 mr-4"
                      tintColor={index < rating ? "#fdda0d" : "#a4a4a4"}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
            <TextInput
              className="bg-white dark:bg-dark-primary rounded-xl font-nregular text-dark-primary dark:text-grey-200 text-base p-2"
              value={reviewText}
              onChangeText={(e) => setReviewText(e)}
              placeholder={t.writeHerePlease}
              placeholderTextColor="#a4a4a4"
              multiline
              textAlignVertical="top"
              numberOfLines={10}
            />
            <Pressable
              onPress={() => {
                sendMarketReview();
              }}
              className="bg-primary rounded-xl flex-row items-center justify-center active:bg-primary-600 mt-2 h-11"
            >
              <CustomText classes="text-base text-white font-nbold mr-2">
                {t.send}
              </CustomText>
              <View>
                {reviewIsLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <></>
                )}
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View className="mb-4"></View>
    </ScrollView>
  );
}
