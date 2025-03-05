import { icons } from "../../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../../utils/utils";
import { CustomText } from "../../../../../utils/CustomText";
import { useFetcher } from "../../../../../utils/useFetcher";
import { useLanguageStore } from "../../../../../utils/useLanguageStore";
import { useUnregCustomerStore } from "../../../../../utils/useUnregCustomerStore";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { useColorScheme } from "nativewind";

const formatPhoneNumber = (phoneNumber) => {
  const formattedNumber = phoneNumber.replace(
    /^(\993)(\d{2})(\d{2})(\d{2})(\d{2})$/,
    "$1 $2 $3-$4-$5"
  );
  return formattedNumber;
};

const Container = ({
  title,
  text,
  containerclasses,
  isPhoneNumber,
  textStyles,
}) => {
  return (
    <View
      className={`bg-grey-50 dark:bg-dark-accent border-b border-grey-200 dark:border-grey-700 flex-row items-center justify-between p-2 min-h-[44px] w-full ${containerclasses}`}
    >
      <CustomText classes="text-dark-primary dark:text-grey-200">
        {title} :
      </CustomText>
      <CustomText
        classes={`font-nbold text-right dark:text-white ${textStyles} py-1 px-2 max-w-[200px]`}
        numberOfLines={40}
      >
        {isPhoneNumber ? formatPhoneNumber(text) : text}
      </CustomText>
    </View>
  );
};

export default function OrderScreen() {
  const { id } = useLocalSearchParams();
  const [orderCancelModalVisible, setOrderCancelModalVisible] = useState(false);
  const [orderEditModalVisible, setOrderEditModalVisible] = useState(false);
  const { language, getTranslations } = useLanguageStore();
  const { addItemsToShoppingCart } = useUnregCustomerStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  const { data: orderInfo = {} } = useFetcher(`${apiURL}/orders/prepare`);

  const {
    data: response = {},
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/orders/fetch/${id}`);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
    } catch (error) {
      Alert.alert(t.error, t.networkError);
    }
    setRefreshing(false);
  };

  if (isLoading)
    return (
      <View className="dark:bg-dark-primary items-center justify-center h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  const {
    phoneNumber,
    Address,
    comment,
    sum,
    pointsEarned,
    payPoints,
    createdAt,
    OrderCity,
    OrderItems,
    PaymentType,
    DeliveryType,
    OrderStatus,
    orderStatusId,
    UnRegisteredCustomer,
    Customer,
  } = response?.order || [];

  const checkOrderStatus = async () => {
    try {
      const response = await fetch(`${apiURL}/orders/fetch/${id}`);
      if (response.ok) {
        const data = await response.json();
        const orderStatusId = data.order?.orderStatusId;

        if (orderStatusId === 1) {
          return true;
        } else {
          Alert.alert(t.notAllowed, t.editingNotAllowed);
          await mutate();
          return false;
        }
      } else {
        Alert.alert(t.error, t.networkError);
        return false;
      }
    } catch (error) {
      Alert.alert(t.error, t.networkError);
      return false;
    }
  };

  const handleOrderCancel = async () => {
    const isStatusValid = await checkOrderStatus();
    if (!isStatusValid) return;

    try {
      const response = await fetch(`${apiURL}/orders/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: Number(id),
        }),
      });

      if (response.ok) {
        Alert.alert(t.success, t.statusChangeSuccess);
        setOrderCancelModalVisible(false);
        await mutate();
      }
    } catch (error) {
      Alert.alert(t.error, t.networkError);
    }
  };

  const handleEditOrder = async () => {
    const isStatusValid = await checkOrderStatus();
    if (!isStatusValid) return;

    const itemsToReturn = OrderItems.map((item) => ({
      barcode: item.productBarcode,
      quantity: Number(item.quantity),
    }));

    addItemsToShoppingCart(itemsToReturn);

    try {
      const response = await fetch(`${apiURL}/orders/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: Number(id),
        }),
      });

      if (response.ok) {
        Alert.alert(t.success, t.statusChangeSuccess);
        setOrderEditModalVisible(false);
        await mutate();
        setTimeout(() => {
          router.navigate("/cart");
        }, 500);
      }
    } catch (error) {
      Alert.alert(t.error, t.networkError);
    }
  };

  return (
    <View className="bg-white dark:bg-dark-primary px-4 h-full">
      <View className="flex-row items-center my-2 h-10">
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
            {t.orderNumber} : {id}
          </CustomText>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="border border-grey-100 dark:border-grey-700 rounded-xl">
          <Container
            title={t.createdAt}
            text={createdAt}
            containerclasses="border-b rounded-t-xl"
          />
          <Container
            title={t.phoneNumber}
            text={phoneNumber}
            isPhoneNumber={true}
          />
          {Customer ? (
            <Container
              title={t.username}
              text={Customer?.username ? Customer?.username : t.no}
            />
          ) : (
            UnRegisteredCustomer && (
              <Container
                title={t.username}
                text={
                  UnRegisteredCustomer?.username
                    ? UnRegisteredCustomer?.username
                    : t.no
                }
              />
            )
          )}
          <Container
            title={t.addressStreet}
            text={Address?.street ? Address?.street : t.no}
          />
          <Container
            title={t.addressHouse}
            text={Address?.house ? Address?.house : t.no}
          />
          <Container
            title={t.addressEntrance}
            text={Address?.entrance ? Address?.entrance : t.no}
          />
          <Container
            title={t.addressRoof}
            text={Address?.roof ? Address?.roof : t.no}
          />
          <Container
            title={t.addressRoom}
            text={Address?.room ? Address?.room : t.no}
          />
          <Container
            title={t.comment}
            text={comment ? comment : t.no}
            textStyles="text-end max-w-[250px]"
          />
          <Container
            title={t.paymentType}
            text={language === "tm" ? PaymentType?.nameTm : PaymentType?.nameRu}
          />
          <Container
            title={t.deliveryType}
            text={
              language === "tm" ? DeliveryType?.nameTm : DeliveryType?.nameRu
            }
          />
          <Container
            title={t.points}
            text={pointsEarned}
            textStyles="text-sky-500"
          />
          <Container
            title={t.payWithPoints}
            text={parseFloat(payPoints).toFixed(2)}
            textStyles="text-sky-500"
          />
          <Container
            title={t.orderStatus}
            text={language === "tm" ? OrderStatus?.nameTm : OrderStatus?.nameRu}
            textStyles="text-sky-500"
          />
          {OrderCity ? (
            <Container
              title={t.deliveryRegionPrice}
              text={
                language === "tm"
                  ? `${OrderCity?.nameTm} / ${OrderCity?.price} M`
                  : `${OrderCity?.nameRu} / ${OrderCity?.price} M`
              }
              textStyles="text-sky-500"
            />
          ) : (
            <></>
          )}
          <Container
            title={t.productsSum}
            text={
              `${
                payPoints > 0
                  ? `( ${parseFloat(sum).toFixed(2)} - ${parseFloat(
                      payPoints
                    ).toFixed(2)} ) =`
                  : ""
              } ${parseFloat(sum - payPoints).toFixed(2)}` + " M"
            }
            textStyles="text-sky-500"
          />
          <Container
            containerclasses="border-0 rounded-b-xl"
            title={t.orderSum}
            textStyles="text-sky-500"
            text={(() => {
              const productSum = parseFloat(sum - payPoints || 0);
              const cityPrice = parseFloat(OrderCity?.price || 0);
              const expressPrice = parseFloat(
                orderInfo?.preparedOrder?.otherInfo?.expressPrice || 0
              );

              if (DeliveryType?.id === 2) {
                return `${productSum.toFixed(2)} M`;
              } else if (DeliveryType?.id === 1 && OrderCity?.id) {
                return `${(productSum + cityPrice).toFixed(2)} M`;
              } else if (DeliveryType?.id === 3 && OrderCity?.id) {
                return `${(productSum + cityPrice + expressPrice).toFixed(
                  2
                )} M`;
              } else {
                return "0 M";
              }
            })()}
          />
        </View>
        <View className="justify-center h-10">
          <CustomText classes="text-lg text-primary">{t.products} :</CustomText>
        </View>
        <View>
          {OrderItems?.map((item) => {
            let sum = item.quantity * item.Product?.currentSellPrice;
            return (
              <Pressable
                key={item.id}
                onPress={() => router.navigate(`/${item?.Product?.barcode}`)}
                className="bg-bg-white dark:bg-dark-accent border border-grey-200 dark:border-transparent rounded-xl active:opacity-70 mb-2 p-1 h-36"
              >
                <View className="flex-1 flex-row items-center">
                  {item?.Product?.imageOne ? (
                    <Image
                      source={{
                        uri: `${apiURL}/${item?.Product?.imageOne}`,
                      }}
                      contentFit="contain"
                      className="bg-white dark:bg-dark-accent border border-grey-200 dark:border-grey-700 rounded-xl mr-2 h-20 w-20"
                    />
                  ) : (
                    <View className="bg-white dark:bg-dark-accent border border-grey-200 dark:border-grey-700 rounded-xl justify-center items-center mr-2 h-20 w-20">
                      <Image
                        source={icons.image}
                        className="h-16 w-16"
                        contentFit="contain"
                        tintColor="#a4a4a4"
                      />
                    </View>
                  )}
                  <View className="py-2 h-full">
                    <View className="flex-row items-center h-full w-full">
                      <CustomText
                        classes="text-xs text-dark-primary dark:text-white w-[220px]"
                        numberOfLines={2}
                      >
                        {language === "tm"
                          ? item?.Product?.nameTm
                          : item?.Product?.nameRu}
                      </CustomText>
                    </View>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mt-2 px-2 h-fit w-full">
                  <View className="bg-grey-100 dark:bg-dark-primary rounded-xl items-center justify-center h-10 w-[30%]">
                    <CustomText classes="text-xs text-dark-primary dark:text-grey-200">
                      {t.quantity}
                    </CustomText>
                    <CustomText classes="text-dark-primary font-nbold dark:text-white">
                      {parseFloat(item?.quantity).toFixed(2)}
                    </CustomText>
                  </View>
                  <View className="bg-grey-100 dark:bg-dark-primary rounded-xl items-center justify-center h-10 w-[30%]">
                    <CustomText classes="text-xs text-dark-primary dark:text-grey-200">
                      {t.price}
                    </CustomText>
                    <CustomText classes="text-dark-primary font-nbold dark:text-white">
                      {parseFloat(item?.Product?.currentSellPrice).toFixed(2)} M
                    </CustomText>
                  </View>
                  <View className="bg-grey-100 dark:bg-dark-primary rounded-xl items-center justify-center h-10 w-[30%]">
                    <CustomText classes="text-xs text-dark-primary dark:text-grey-200">
                      {t.sum}
                    </CustomText>
                    <CustomText classes="text-dark-primary font-nbold dark:text-white">
                      {parseFloat(sum).toFixed(2)} М
                    </CustomText>
                  </View>
                </View>
              </Pressable>
            );
          })}
          <View className="flex-row items-center justify-end">
            {orderStatusId === 1 ? (
              <Pressable
                onPress={() => setOrderEditModalVisible(true)}
                className="bg-primary rounded-xl flex-row items-center justify-center self-end active:bg-primary-600 mr-2 px-4 h-11 w-fit"
              >
                <Image
                  source={icons.edit}
                  contentFit="contain"
                  className="mr-1 h-4 w-4"
                  tintColor="#ffffff"
                />
                <CustomText classes="font-nsemibold text-white">
                  {t.edit}
                </CustomText>
              </Pressable>
            ) : (
              <></>
            )}
            {OrderStatus?.id === 1 ? (
              <Pressable
                onPress={() => setOrderCancelModalVisible(true)}
                className="bg-primary rounded-xl flex-row items-center justify-center self-end active:bg-primary-600 px-4 h-11 w-fit"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="mr-1 h-5 w-5"
                  tintColor="#ffffff"
                />
                <CustomText classes="font-nsemibold text-white">
                  {t.orderCancel}
                </CustomText>
              </Pressable>
            ) : (
              <></>
            )}
          </View>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={orderCancelModalVisible}
          statusBarTranslucent
        >
          <View className="bg-black/30 flex-1 items-center justify-center">
            <View className="bg-grey-50 dark:bg-dark-accent border border-grey-200 dark:border-grey-700 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
              <CustomText
                classes="text-lg text-dark-primary dark:text-grey-200 text-center"
                numberOfLines={2}
              >
                {t.cancelOrder}
              </CustomText>
              <CustomText
                classes="text-base text-dark-primary dark:text-grey-200 text-center"
                numberOfLines={2}
              >
                {t.cancelOrderWarning}
              </CustomText>
              <View className="rounded-xl flex-row justify-between items-center mt-4 h-11 w-full">
                <Pressable
                  onPress={() => {
                    setOrderCancelModalVisible(false);
                  }}
                  className="dark:bg-dark-primary border border-grey-200 dark:border-grey-700 rounded-xl items-center justify-center active:border-primary h-full w-20"
                >
                  <CustomText classes="text-base text-dark-primary dark:text-white">
                    {t.no}
                  </CustomText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    handleOrderCancel();
                  }}
                  className="dark:bg-dark-primary border border-grey-200 dark:border-grey-700 rounded-xl items-center justify-center active:border-primary h-full w-20"
                >
                  <CustomText classes="text-base text-dark-primary dark:text-white">
                    {t.yes}
                  </CustomText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={orderEditModalVisible}
          statusBarTranslucent
        >
          <View className="bg-black/30 flex-1 items-center justify-center">
            <View className="bg-grey-50 dark:bg-dark-accent border border-grey-200 dark:border-grey-700 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
              <CustomText
                classes="text-lg text-dark-primary dark:text-grey-200 text-center"
                numberOfLines={2}
              >
                {t.editOrderHeader}
              </CustomText>
              <CustomText
                classes="text-base text-dark-primary dark:text-grey-200 text-center"
                numberOfLines={2}
              >
                {t.editOrderInfo}
              </CustomText>
              <View className="rounded-xl flex-row justify-between items-center mt-4 h-11 w-full">
                <Pressable
                  onPress={() => {
                    setOrderEditModalVisible(false);
                  }}
                  className="dark:bg-dark-primary border border-grey-200 dark:border-grey-700 active:border-primary rounded-xl items-center justify-center h-full w-20"
                >
                  <CustomText classes="text-base text-dark-primary dark:text-white">
                    {t.no}
                  </CustomText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    handleEditOrder();
                  }}
                  className="dark:bg-dark-primary border border-grey-200 dark:border-grey-700 active:border-primary rounded-xl items-center justify-center h-full w-20"
                >
                  <CustomText classes="text-base text-dark-primary dark:text-white">
                    {t.yes}
                  </CustomText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <View className="mb-2"></View>
      </ScrollView>
    </View>
  );
}
