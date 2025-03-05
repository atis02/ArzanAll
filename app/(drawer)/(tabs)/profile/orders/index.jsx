import { icons } from "../../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../../utils/utils";
import { CustomText } from "../../../../../utils/CustomText";
import { useFetcher } from "../../../../../utils/useFetcher";
import { useUnregCustomerStore } from "../../../../../utils/useUnregCustomerStore";
import { useCustomerStore } from "../../../../../utils/useCustomerStore";
import { useLanguageStore } from "../../../../../utils/useLanguageStore";
import { router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useColorScheme } from "nativewind";

const Container = ({
  text,
  onPress,
  orderNo,
  orderDateText,
  orderDateValue,
  paymentText,
  paymentValue,
  orderStatusText,
  orderStatus,
  orderTimeText,
  orderTimeValue,
  orderSum,
  containerClasses,
  sum,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-grey-50 dark:bg-dark-accent border border-grey-200 dark:border-transparent rounded-xl active:opacity-80 mb-2 h-fit ${containerClasses}`}
    >
      <View className="bg-primary border-b border-grey dark:border-transparent rounded-t-xl flex-row items-center px-2 h-9 w-full">
        <CustomText classes="text-base text-dark-accent dark:text-grey-200">
          {text} :{" "}
        </CustomText>
        <CustomText classes="text-base text-dark-accent dark:text-grey-200">
          {orderNo}
        </CustomText>
      </View>
      <View className="flex-row items-center p-2">
        <View className="w-1/2">
          <CustomText classes="text-dark-accent dark:text-grey-200 font-nsemibold">
            • {orderDateText}
          </CustomText>
          <CustomText classes="text-dark-accent dark:text-grey-200">
            {orderDateValue}
          </CustomText>
        </View>
        <View className="w-1/2">
          <CustomText classes="text-dark-accent dark:text-grey-200 font-nsemibold">
            • {orderStatusText}
          </CustomText>
          <CustomText classes="bg-primary rounded-xl text-dark-accent dark:text-grey-200 px-1">
            {orderStatus}
          </CustomText>
        </View>
      </View>
      <View className="flex-row items-center p-2">
        <View className="w-1/2">
          <CustomText classes="text-dark-accent dark:text-grey-200 font-nsemibold">
            • {paymentText}
          </CustomText>
          <CustomText classes="text-dark-accent dark:text-grey-200">
            {paymentValue}
          </CustomText>
        </View>
        <View className="w-1/2">
          <CustomText classes="text-dark-accent dark:text-grey-200 font-nsemibold">
            • {orderTimeText}
          </CustomText>
          <CustomText classes="text-dark-accent dark:text-grey-200">
            {orderTimeValue}
          </CustomText>
        </View>
      </View>
      <View className="border-t border-grey-200 flex-row items-center justify-between px-2 h-9 w-full">
        <CustomText classes="text-base text-primary font-nsemibold">
          {sum}
        </CustomText>
        <CustomText classes="text-base text-primary font-nsemibold">
          {" "}
          {orderSum}
        </CustomText>
      </View>
    </Pressable>
  );
};

export default function OrdersScreen() {
  const { language, getTranslations } = useLanguageStore();
  const { unRegCustomer } = useUnregCustomerStore();
  const { useCustomerData } = useCustomerStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const { data: orderInfo = {} } = useFetcher(`${apiURL}/orders/prepare`);

  const apiEndpoint = useCustomerData?.id
    ? `${apiURL}/customer/fetch/${useCustomerData.id}`
    : `${apiURL}/customer/unreg/${unRegCustomer?.unRegisteredCustomerId}`;

  const {
    data: response = [],
    error,
    isLoading,
    mutate,
  } = useFetcher(apiEndpoint);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    mutate()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  if (isLoading)
    return (
      <View className="dark:bg-dark-primary items-center justify-center h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

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
          <CustomText classes="font-nbold text-primary text-lg">
            {t.orders}
          </CustomText>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {response?.Orders?.length > 0 ? (
          <View className="">
            {response?.Orders?.sort((a, b) => b.id - a.id)?.map((item) => {
              return (
                <Container
                  text={t.orderNumber}
                  key={item?.id}
                  onPress={() => router.navigate(`/profile/orders/${item.id}`)}
                  orderNo={item?.id}
                  orderDateText={t.orderCreatedAt}
                  orderDateValue={new Date(item?.createdAt).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }
                  )}
                  orderStatusText={t.orderStatus}
                  orderStatus={
                    language === "tm"
                      ? item?.OrderStatus?.nameTm
                      : item?.OrderStatus?.nameRu
                  }
                  paymentText={t.paymentType}
                  paymentValue={
                    language === "tm"
                      ? item?.PaymentType?.nameTm
                      : item?.PaymentType?.nameRu
                  }
                  orderTimeText={t.deliveryTime}
                  orderTimeValue={
                    item?.OrderTime ? (
                      <>
                        {language === "tm"
                          ? item?.OrderTime?.nameTm +
                            " / " +
                            item?.OrderTime?.time
                          : item?.OrderTime?.nameRu +
                            " / " +
                            item?.OrderTime?.time}
                      </>
                    ) : (
                      <>{t.outOfCity}</>
                    )
                  }
                  sum={t.orderSum}
                  orderSum={(() => {
                    const productSum = parseFloat(
                      item?.sum - item?.payPoints || 0
                    );
                    const cityPrice = parseFloat(item?.OrderCity?.price || 0);
                    const expressPrice = parseFloat(
                      orderInfo?.preparedOrder?.otherInfo?.expressPrice || 0
                    );

                    if (item?.deliveryTypeId === 2) {
                      return `${productSum.toFixed(2)} M`;
                    } else if (
                      item?.deliveryTypeId === 1 &&
                      item?.orderCityId
                    ) {
                      return `${(productSum + cityPrice).toFixed(2)} M`;
                    } else if (
                      item?.deliveryTypeId === 3 &&
                      item?.orderCityId
                    ) {
                      return `${(productSum + cityPrice + expressPrice).toFixed(
                        2
                      )} M`;
                    } else {
                      return "0 M";
                    }
                  })()}
                />
              );
            })}
          </View>
        ) : (
          <CustomText
            classes="font-nsemibold text-base text-dark-primary dark:text-grey-200"
            numberOfLines={2}
          >
            {t.noOrders}
          </CustomText>
        )}
      </ScrollView>
    </View>
  );
}
