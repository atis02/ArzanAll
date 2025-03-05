import FormField from "../../../components/nav/FormField";
import ProductContainerCart from "../../../components/containers/ProductContainerCart";
import { icons } from "../../../utils/icons";
import { CustomText } from "../../../utils/CustomText";
import { apiURL, LoadingLarge } from "../../../utils/utils";
import { throwToast } from "../../../utils/Toaster";
import { AddToWaitlist } from "../../../components/functions/AddToWaitList";
import { useCustomerStore } from "../../../utils/useCustomerStore";
import { useLanguageStore } from "../../../utils/useLanguageStore";
import { useUnregCustomerStore } from "../../../utils/useUnregCustomerStore";
import { useState, useCallback, useEffect, useRef } from "react";
import { useFocusEffect, router } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";

const glutenFreeCategoryId = "6518dba0-f9c4-4264-9fa9-4f37c49ca328";

const formatQuantity = (quantity) => {
  return quantity?.toFixed(2);
};

const getCurrentDate = () => {
  return new Date().toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatAddress = (address) => {
  const parts = [
    address?.street,
    address?.house,
    address?.entrance,
    address?.roof,
    address?.room,
  ].filter((part) => part && part?.trim());

  return parts?.join(", ");
};

export default function CartScreen() {
  const [orderInfo, setOrderInfo] = useState({});
  const [productsArray, setProductsArray] = useState([]);
  const [orderModalIsVisible, setOrderModalIsVisible] = useState(false);
  const [orderRegionModalIsVisible, setOrderRegionModalIsVisible] =
    useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [availableOrderTimes, setAvailableOrderTimes] = useState([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(1);
  const [selectedPaymentType, setSelectedPaymentType] = useState(1);
  const [selectedCourier, setSelectedCourier] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [cartCleanModal, setCartCleanModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [glutenPrice, setGlutenPrice] = useState(0);
  const [changedItems, setChangedItems] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollViewRef = useRef(null);
  const { useCustomerData } = useCustomerStore();
  const {
    shoppingCart,
    unRegCustomer,
    updateUnRegCustomer,
    setShoppingCartQuantity,
    clearShoppingCart,
  } = useUnregCustomerStore();
  const [form, setForm] = useState({
    phoneNumber:
      useCustomerData?.phoneNumber?.slice(4) ||
      unRegCustomer?.phoneNumber?.slice(3) ||
      "",
    username: useCustomerData?.username || unRegCustomer?.username || "",
    comment: "",
    payPoints: 0,
    address: {
      street:
        useCustomerData?.AddressOne?.street ||
        unRegCustomer?.address?.street ||
        "",
      house:
        useCustomerData?.AddressOne?.house ||
        unRegCustomer?.address?.house ||
        "",
      entrance:
        useCustomerData?.AddressOne?.entrance ||
        unRegCustomer?.address?.entrance ||
        "",
      roof:
        useCustomerData?.AddressOne?.roof || unRegCustomer?.address?.roof || "",
      room:
        useCustomerData?.AddressOne?.room || unRegCustomer?.address?.room || "",
    },
  });
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);

        try {
          const orderResponse = await fetch(`${apiURL}/orders/prepare`);
          const preparedOrder = await orderResponse.json();

          const customerResponse = await fetch(
            `${apiURL}/customer/points/fetch/${useCustomerData?.id}`
          );
          const customerData = await customerResponse.json();
          setAvailablePoints(customerData?.pointsEarned);

          const barcodes = [
            ...new Set(shoppingCart.map((item) => item?.barcode)),
          ];
          const requestBody = {
            products: barcodes?.map((barcode) => ({ barcode })),
          };

          const response = await fetch(`${apiURL}/products/latestdata`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          const updatedProducts = await response.json();

          let deliveryPriceSum = 0;

          const mergedProducts = shoppingCart.map((cartItem) => {
            const productData = updatedProducts.find(
              (product) => product.barcode === cartItem.barcode
            );

            if (productData) {
              if (
                productData?.Category?.id ===
                  "6518dba0-f9c4-4264-9fa9-4f37c49ca328" &&
                productData?.Category?.deliveryPrice > 0
              ) {
                deliveryPriceSum = productData?.Category?.deliveryPrice;
              }
              return {
                ...cartItem,
                ...productData,
              };
            }

            return cartItem;
          });

          setProductsArray(mergedProducts);
          setOrderInfo(preparedOrder?.preparedOrder);
          setSelectedCourier(1);
          setSelectedDeliveryType(1);
          setSelectedPaymentType(1);
          setGlutenPrice(deliveryPriceSum);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [useCustomerData?.id, shoppingCart])
  );

  const {
    otherInfo = {},
    orderCities = [],
    orderTimes = [],
    deliveryTypes = [],
    paymentTypes = [],
    couriers = [],
  } = orderInfo;

  useEffect(() => {
    function updateAvailableTimes() {
      if (!orderTimes.length) return;

      setSelectedDate(null);
      const currentDateTime = new Date();
      const currentHours = currentDateTime?.getHours();
      const currentMinutes = currentDateTime?.getMinutes();

      const todaysTimes = orderTimes
        .filter((item) => {
          if (item.nameRu === "Сегодня" || item.nameTm === "Şu gün") {
            const [startTime] = item.time.split(" - ");
            const [startHour, startMinute] = startTime.split(":").map(Number);

            return (
              startHour > currentHours ||
              (startHour === currentHours && startMinute > currentMinutes)
            );
          }
          return false;
        })
        .sort((a, b) => {
          const aStartHour = parseInt(a.time.split(" - ")[0].split(":")[0], 10);
          const bStartHour = parseInt(b.time.split(" - ")[0].split(":")[0], 10);
          return aStartHour - bStartHour;
        });

      const showTomorrowsTimes = currentHours >= 9;
      const tomorrowsTimes = orderTimes
        .filter((item) => {
          if (item.nameRu === "Завтра" || item.nameTm === "Ertir") {
            return showTomorrowsTimes;
          }
          return false;
        })
        .sort((a, b) => {
          const aStartHour = parseInt(a.time.split(" - ")[0].split(":")[0], 10);
          const bStartHour = parseInt(b.time.split(" - ")[0].split(":")[0], 10);
          return aStartHour - bStartHour;
        });

      const filteredTimes = [...todaysTimes, ...tomorrowsTimes];
      setAvailableOrderTimes(filteredTimes);
    }

    updateAvailableTimes();
    const intervalId = setInterval(updateAvailableTimes, 180000);

    return () => clearInterval(intervalId);
  }, [orderTimes]);

  useEffect(() => {
    if (!isLoading && scrollViewRef.current && scrollPosition > 0) {
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
    }
  }, [isLoading]);

  let totalSum = 0;

  useEffect(() => {
    let calculatedTotalSum = 0;

    productsArray?.length > 0 &&
      productsArray.forEach((product) => {
        const quantity = parseFloat(product?.quantity);
        const currentSellPrice = parseFloat(product?.currentSellPrice);
        let productTotal = 0;

        productTotal = quantity * currentSellPrice;

        calculatedTotalSum += productTotal;
      });

    totalSum = calculatedTotalSum;

    if (
      otherInfo?.pointSystemIsActive &&
      otherInfo?.pointsPercentage !== "0" &&
      otherInfo?.pointsPercentage !== 0 &&
      totalSum > 0
    ) {
      const percentage = parseFloat(otherInfo.pointsPercentage) / 100;
      const calculatedPoints = totalSum * percentage;
      setCurrentPoints(calculatedPoints);
    } else {
      setCurrentPoints(0);
    }
  }, [
    otherInfo?.pointSystemIsActive,
    otherInfo?.pointsPercentage,
    productsArray,
  ]);

  productsArray?.length > 0 &&
    productsArray.forEach((product) => {
      const quantity = parseFloat(product?.quantity);
      const currentSellPrice = parseFloat(product?.currentSellPrice);
      let productTotal = 0;

      productTotal = quantity * currentSellPrice;

      totalSum += productTotal;
    });

  const products = shoppingCart?.map((item) => ({
    barcode: item?.barcode,
    quantity: parseFloat(item?.quantity),
  }));

  const checkStockAndProceed = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(`${apiURL}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItems: shoppingCart }),
      });

      const data = await response.json();
      const adjustedItems = data.adjustedItems || [];

      const updatedProducts = adjustedItems?.reduce((acc, adjustedItem) => {
        const originalItem = productsArray?.find(
          (item) => item.barcode === adjustedItem?.barcode
        );
        if (
          originalItem &&
          originalItem.quantity !== Number(adjustedItem?.quantity)
        ) {
          acc.push({
            image: originalItem?.imageOne,
            barcode: adjustedItem?.barcode,
            oldQuantity: originalItem?.quantity,
            newQuantity: adjustedItem?.quantity,
            nameRu: originalItem?.nameRu,
            nameTm: originalItem?.nameTm,
            originalItem: originalItem,
          });

          setShoppingCartQuantity(
            adjustedItem?.barcode,
            Number(adjustedItem?.quantity)
          );
        }
        return acc;
      }, []);

      const updateLocalShoppingCart = (adjustedItems) => {
        adjustedItems?.forEach((adjustedItem) => {
          const originalItem = productsArray.find(
            (item) => item.barcode === adjustedItem?.barcode
          );

          if (
            originalItem &&
            originalItem?.quantity !== Number(adjustedItem?.quantity)
          ) {
            setShoppingCartQuantity(
              adjustedItem?.barcode,
              Number(adjustedItem?.quantity)
            );
          }
        });
      };

      updateLocalShoppingCart(adjustedItems);

      if (updatedProducts.length > 0) {
        setChangedItems(updatedProducts);
        setStockModalVisible(true);
      } else {
        await handleMakeOrder();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakeOrder = async () => {
    if (form.payPoints > availablePoints) {
      Alert.alert(t.attention, t.notEnoughPoints);
      return;
    }

    if (form.username === "") {
      Alert.alert(t.emptyFieldHeader, t.usernameIsMust);
      return;
    }

    if (form.phoneNumber === "") {
      Alert.alert(t.emptyFieldHeader, t.noPhoneNumber);
      return;
    }

    if (
      selectedDeliveryType !== 2 &&
      selectedDeliveryType !== 3 &&
      !selectedDate
    ) {
      Alert.alert(t.emptyFieldHeader, t.fillDate);
      return;
    }

    if (selectedDeliveryType !== 2 && !form.address.street) {
      Alert.alert(t.emptyFieldHeader, t.fillStreet);
      return;
    }

    if (selectedDeliveryType !== 2 && !form.address.house) {
      Alert.alert(t.emptyFieldHeader, t.fillHouse);
      return;
    }

    if (selectedDeliveryType !== 2 && !selectedRegion) {
      Alert.alert(t.emptyFieldHeader, t.fillOrderCity);
      return;
    }

    setSubmitting(true);

    const orderFormData = {
      phoneNumber: "993" + form.phoneNumber,
      address: selectedDeliveryType === 2 ? null : form.address,
      username: form.username,
      comment: form.comment,
      sum: formatQuantity(totalSum),
      orderItems: products,
      orderCityId: selectedDeliveryType === 2 ? null : selectedRegion,
      orderTimeId: selectedDate,
      paymentTypeId: selectedPaymentType,
      deliveryTypeId: selectedDeliveryType,
      courierLangId: selectedCourier,
      orderStatusId: 1,
      customerId: useCustomerData?.id || null,
      unRegisteredCustomerId: unRegCustomer?.unRegisteredCustomerId || null,
      pointsEarned: currentPoints || 0,
      payPoints: form.payPoints,
    };

    try {
      const response = await fetch(`${apiURL}/orders/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderFormData),
      });

      if (response.status === 403) {
        const data = await response.json();
        Alert.alert(t.warning, data.message, [{ text: "ОК" }]);
        return;
      }

      if (response.ok) {
        const res = await response.json();
        Alert.alert(t.success, t.orderIsMade);
        updateUnRegCustomer(res?.order);
        clearShoppingCart();
        setOrderModalIsVisible(false);
        router.navigate(`/profile/orders/${res?.order?.id}`);
      } else {
        Alert.alert(t.error, t.networkError);
      }
    } catch (err) {
      Alert.alert(t.error, err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnToCart = () => {
    setStockModalVisible(false);
  };

  const handleConfirmChanges = async () => {
    if (productsArray?.length === 0) {
      Alert.alert(t.emptyCartHeader, t.addProductsToCart);
      setStockModalVisible(false);
      setOrderModalIsVisible(false);
      return;
    } else {
      await handleMakeOrder();
      setStockModalVisible(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      address: {
        ...prevForm.address,
        [field]: value,
      },
    }));
  };

  const groupedProducts = productsArray.reduce((acc, product) => {
    const categoryName =
      language === "tm" ? product?.Category?.nameTm : product?.Category?.nameRu;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  const entries = Object.entries(groupedProducts);
  const glutenFreeId = "6518dba0-f9c4-4264-9fa9-4f37c49ca328";

  const [glutenFreeCategory, otherCategories] = entries?.reduce(
    (acc, entry) => {
      const [categoryName, items] = entry;
      const isGlutenFree = items.some(
        (product) => product?.Category?.id === glutenFreeId
      );
      isGlutenFree ? acc[0].push(entry) : acc[1].push(entry);
      return acc;
    },
    [[], []]
  );

  const sortedPaymentTypes = paymentTypes?.sort((a, b) => a.id - b.id);

  const glutenProductsPrice = productsArray
    ?.filter((product) => product?.Category?.id === glutenFreeCategoryId)
    .reduce((sum, product) => {
      return sum + parseFloat(product?.currentSellPrice) * product?.quantity;
    }, 0);

  const getSavedAddresses = useCallback(() => {
    if (!useCustomerData) return [];

    return [
      {
        id: 1,
        address: useCustomerData?.AddressOne,
        color: "bg-green-500",
        title: t.addressOne,
      },
      {
        id: 2,
        address: useCustomerData?.AddressTwo,
        color: "bg-primary",
        title: t.addressTwo,
      },
      {
        id: 3,
        address: useCustomerData?.AddressThree,
        color: "bg-sky-400",
        title: t.addressThree,
      },
    ].filter((item) => item?.address !== null);
  }, [useCustomerData]);

  const handleScroll = (event) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  const hasOnlyGlutenProducts = productsArray?.every(
    (item) => item?.Category?.id === glutenFreeCategoryId
  );

  return (
    <View className="bg-white dark:bg-dark-primary py-2 px-4 h-full">
      {shoppingCart?.length > 0 ? (
        <>
          <View className="border-b border-grey-200 dark:border-grey flex-row items-center pb-1">
            <CustomText classes="font-nbold text-primary text-lg">
              {t.shoppingcart}
            </CustomText>
            <Pressable
              className="justify-center items-center active:opacity-70 ml-auto h-6 w-6"
              onPress={() => setCartCleanModal(true)}
            >
              <Image
                source={icons.trashBin}
                contentFit="contain"
                className="h-5 w-6"
                transition={100}
                tintColor="#ff5959"
              />
            </Pressable>
          </View>
          {isLoading ? (
            <View className="items-center justify-center">
              <LoadingLarge />
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={25}
            >
              <View className="mt-2">
                {glutenFreeCategory?.map(([category, items]) => (
                  <View
                    key={category}
                    className="bg-green-600 rounded-xl mb-2 p-1"
                  >
                    <CustomText
                      classes="text-left text-base font-nbold mb-1 text-white"
                      numberOfLines={4}
                    >
                      {category}
                    </CustomText>
                    {items?.map((product) => (
                      <View key={product?.barcode} className="mb-2">
                        <ProductContainerCart product={product} />
                      </View>
                    ))}
                  </View>
                ))}
                {otherCategories?.map(([category, items]) => (
                  <View key={category} className="rounded-xl">
                    {items?.map((product) => (
                      <View key={product?.barcode} className="mb-2">
                        <ProductContainerCart product={product} />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          <View className="border-t border-grey-200 dark:border-grey-700 flex-row items-center justify-between pt-2 mt-auto h-14 w-full">
            <View>
              <CustomText classes="text-dark-accent dark:text-grey-200 text-sm font-nbold">
                {t.productsSum} :
                <CustomText classes="text-primary text-sm font-nbold">
                  {" "}
                  {formatQuantity(totalSum || 0)} M
                </CustomText>
              </CustomText>
            </View>
            {otherInfo?.ordersValid === true ? (
              <Pressable
                onPress={() => setOrderModalIsVisible(true)}
                className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 px-2 h-11 w-36"
                disabled={submitting}
              >
                <CustomText
                  classes="font-nsemibold text-xs text-white text-center mr-1"
                  numberOfLines={2}
                >
                  {t.prepareOrder}
                </CustomText>
              </Pressable>
            ) : (
              <Pressable className="bg-primary rounded-xl flex flex-row justify-center items-center h-11">
                <CustomText
                  classes="font-nsemibold text-white text-xs text-center w-36"
                  numberOfLines={2}
                >
                  {t.noOrdersToday}
                </CustomText>
              </Pressable>
            )}
          </View>
        </>
      ) : (
        <CustomText
          classes="text-base text-dark-primary dark:text-grey-200"
          numberOfLines={2}
        >
          {t.emptyShoppingCart}
        </CustomText>
      )}
      <Modal animationType="fade" transparent={true} visible={cartCleanModal}>
        <View className="flex-1 items-center justify-center">
          <View className="bg-grey-50 dark:bg-dark-accent border border-grey-400 dark:border-grey-700 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <View className="flex-row justify-between items-center w-full">
              <CustomText
                classes="text-base text-dark-accent dark:text-grey-200"
                numberOfLines={2}
              >
                {t.cartCleanHeader}
              </CustomText>
              <Pressable
                onPress={() => setCartCleanModal(false)}
                className="border border-grey-800 dark:border-grey-200 rounded-xl items-center justify-center active:border-primary ml-auto h-9 w-9"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-6 w-6"
                  tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
                />
              </Pressable>
            </View>
            <View className="flex-row justify-between items-center h-fit w-full">
              <Pressable
                onPress={() => {
                  setCartCleanModal(false);
                }}
                className="bg-primary rounded-xl items-center justify-center active:bg-primary-600 h-11 w-[48%]"
              >
                <CustomText classes="font-bsemibold text-base text-white">
                  {t.no}
                </CustomText>
              </Pressable>
              <Pressable
                onPress={() => {
                  clearShoppingCart();
                  throwToast(t.cartCleared);
                  setCartCleanModal(false);
                }}
                className="bg-primary rounded-xl items-center justify-center active:bg-primary-600 h-11 w-[48%]"
              >
                <CustomText classes="font-bsemibold text-base text-white">
                  {t.yes}
                </CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={orderModalIsVisible}
        onRequestClose={() => {
          setOrderModalIsVisible(false);
          setSelectedDate(null);
          setSelectedDeliveryType(1);
        }}
      >
        <Modal
          animationType="fade"
          transparent={true}
          visible={stockModalVisible}
        >
          <View className="bg-grey/50 dark:bg-dark/50 flex-1 items-center justify-center z-10">
            <View className="bg-grey-50 dark:bg-dark-accent border border-grey-300 dark:border-transparent rounded-xl items-center p-4 pt-2 w-80">
              <CustomText classes="font-nbold text-dark-primary dark:text-white text-lg">
                {t.stockHeader}
              </CustomText>
              <View className="flex-col space-y-2 mt-2 w-full">
                {changedItems?.length > 0 &&
                  changedItems?.map((item) => (
                    <View
                      key={item?.barcode}
                      className="border border-grey-300 dark:border-transparent rounded-xl p-1"
                    >
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: `${apiURL}/${item?.image}` }}
                          contentFit="contain"
                          className="bg-white rounded-xl mr-4 h-16 w-16"
                        />
                        <View>
                          <CustomText classes="font-nsemibold text-sm text-dark-primary dark:text-grey-200 w-44">
                            {language === "tm" ? item?.nameTm : item?.nameRu}
                          </CustomText>
                          <CustomText classes="font-nsemibold text-sm text-dark-primary dark:text-grey-200">
                            {t.oldQuantity}: {item?.oldQuantity}
                          </CustomText>
                          <CustomText classes="font-nsemibold text-sm text-dark-primary dark:text-grey-200">
                            {t.newQuantity}:{" "}
                            <CustomText classes="text-primary font-nbold">
                              {parseFloat(item?.newQuantity).toFixed(2)}
                            </CustomText>
                          </CustomText>
                        </View>
                      </View>
                      <AddToWaitlist product={item?.originalItem} />
                    </View>
                  ))}
              </View>
              <View className="flex-row justify-between mt-2 w-full">
                <Pressable
                  onPress={handleReturnToCart}
                  className="bg-grey-200 rounded-xl flex-row justify-center items-center active:opacity-80 h-12 w-32"
                >
                  <CustomText classes="text-base text-center">
                    {t.back}
                  </CustomText>
                </Pressable>
                <Pressable
                  onPress={handleConfirmChanges}
                  className="bg-primary rounded-xl flex-row justify-center items-center active:opacity-80 h-12 w-32"
                >
                  <CustomText classes="text-base text-center text-white">
                    {t.continue}
                  </CustomText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={orderRegionModalIsVisible}
          statusBarTranslucent
          onRequestClose={() => {
            setOrderRegionModalIsVisible(false);
          }}
        >
          <View className="flex-1 bg-black/50">
            <View className="bg-white dark:bg-dark-accent border border-grey-300 dark:border-grey-700 rounded-t-3xl relative pt-4 px-4 mt-auto h-[80%] w-full">
              <View className="border-b border-grey-100 dark:border-grey-700 flex-row justify-between items-center mb-2 h-11">
                <CustomText
                  classes="text-dark-primary dark:text-grey-200 text-base font-nbold"
                  numberOfLines={2}
                >
                  {t.deliveryRegion}
                </CustomText>
                <Pressable
                  onPress={() => {
                    setOrderRegionModalIsVisible(false);
                  }}
                  className="bg-grey-50 dark:bg-dark-primary border border-grey-300 dark:border-grey rounded-xl items-center justify-center active:border-primary h-9 w-9 z-10"
                >
                  <Image
                    source={icons.cross}
                    contentFit="contain"
                    className="h-5 w-5"
                    tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
                  />
                </Pressable>
              </View>
              <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
                <View className="w-full">
                  {orderCities?.map((item) => (
                    <View className="mb-2 w-full" key={item?.id}>
                      <Pressable
                        onPress={() => {
                          setSelectedRegion(item?.id);
                          setOrderRegionModalIsVisible(false);
                        }}
                        className={`rounded-xl flex flex-row justify-between items-center px-2 h-11 w-full ${
                          selectedRegion === item?.id
                            ? "bg-primary"
                            : "bg-grey-50 dark:bg-dark-primary"
                        }`}
                      >
                        <CustomText
                          classes={`text-base font-nsemibold ${
                            selectedRegion === item?.id
                              ? "text-white"
                              : "text-dark-accent dark:text-grey-200"
                          }`}
                        >
                          {language === "tm" ? item?.nameTm : item?.nameRu}
                        </CustomText>
                        <CustomText
                          classes={`text-base font-nsemibold ${
                            selectedRegion === item?.id
                              ? "text-white"
                              : "text-dark-accent dark:text-grey-200"
                          }`}
                        >
                          {item?.price} M
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
          className="bg-white rounded-t-3xl"
        >
          <View
            style={{ flexGrow: 1 }}
            className={`bg-white dark:bg-dark-accent border border-primary rounded-t-3xl relative px-4 ${
              Platform.OS === "ios" ? "pt-12" : "pt-2"
            } h-full w-full`}
          >
            <View>
              <View className="flex-row items-center justify-between mb-2 h-11">
                <CustomText classes="text-base text-primary font-nbold">
                  {t.prepareOrder}
                </CustomText>
                <Pressable
                  onPress={() => {
                    setOrderModalIsVisible(false);
                    setSelectedDate(null);
                    setSelectedDeliveryType(1);
                  }}
                  className="bg-grey-50 dark:bg-dark-primary border border-grey-300 dark:border-grey-200 rounded-xl items-center justify-center active:border-primary h-9 w-9 z-10"
                >
                  <Image
                    source={icons.cross}
                    contentFit="contain"
                    className="h-5 w-5"
                    tintColor={colorScheme === "dark" ? "#e7e5ef" : "#1b1c1d"}
                  />
                </Pressable>
              </View>
              <View className="flex-row items-center justify-between">
                <CustomText classes="dark:text-grey-200">{t.date}</CustomText>
                <CustomText classes="font-nbold dark:text-white">
                  {getCurrentDate()}
                </CustomText>
              </View>
              <View className="flex-row items-center justify-between">
                <CustomText classes="dark:text-grey-200">
                  {t.productsSum}
                </CustomText>
                <CustomText classes="font-nbold dark:text-white">
                  {parseFloat(totalSum).toFixed(2)} M
                </CustomText>
              </View>
              {otherInfo?.pointSystemIsActive &&
              otherInfo?.pointsPercentage !== "0" &&
              otherInfo?.pointsPercentage !== 0 &&
              totalSum > 0 &&
              useCustomerData?.phoneNumber ? (
                <View className="flex-row items-center justify-between">
                  <CustomText classes="text-dark-accent dark:text-grey-200">
                    {t.points}
                  </CustomText>
                  <CustomText classes="text-dark-accent dark:text-grey-200 font-nbold">
                    {currentPoints?.toFixed(2)}{" "}
                  </CustomText>
                </View>
              ) : (
                <></>
              )}
              <View className="flex-row items-center justify-between">
                <CustomText classes="dark:text-grey-200">
                  {t.deliveryPrice}
                </CustomText>
                <CustomText classes="font-nbold dark:text-white">
                  {/* Asgabat - Dine Gluten */}
                  {selectedDeliveryType === 1 &&
                    selectedRegion === 1 &&
                    hasOnlyGlutenProducts && (
                      <>{parseFloat(glutenPrice).toFixed(2) + " M"}</>
                    )}

                  {/* Basgalar - Dine Gluten */}
                  {selectedDeliveryType === 1 &&
                    selectedRegion !== 1 &&
                    hasOnlyGlutenProducts && (
                      <>
                        {(orderCities?.find(
                          (city) => city?.id === selectedRegion
                        )?.price || 0) + " M"}
                      </>
                    )}

                  {/* Asgabat - Arzanal We Gluten */}
                  {selectedDeliveryType === 1 &&
                    selectedRegion === 1 &&
                    hasOnlyGlutenProducts === false && (
                      <>
                        {(orderCities?.find(
                          (city) => city?.id === selectedRegion
                        )?.price + glutenPrice || 0) + " M"}
                      </>
                    )}

                  {/* Basgalar - Arzanal We Gluten */}
                  {selectedDeliveryType === 1 &&
                    selectedRegion !== 1 &&
                    hasOnlyGlutenProducts === false && (
                      <>
                        {(orderCities?.find(
                          (city) => city?.id === selectedRegion
                        )?.price * (glutenPrice > 0 ? 2 : 1) || 0) + " M"}
                      </>
                    )}

                  {/* Baryp almak */}
                  {selectedDeliveryType === 2 && "0 M"}

                  {/* Express - Asgabat - Dine Gluten */}
                  {selectedDeliveryType === 3 &&
                    selectedRegion === 1 &&
                    hasOnlyGlutenProducts && (
                      <>{parseFloat(glutenPrice * 2).toFixed(2) + " M"}</>
                    )}

                  {/* Express - Basgalar - Dine Gluten */}
                  {selectedDeliveryType === 3 &&
                    selectedRegion !== 1 &&
                    hasOnlyGlutenProducts && (
                      <>
                        {(orderCities?.find(
                          (city) => city?.id === selectedRegion
                        )?.price * 2 || 0) + " M"}
                      </>
                    )}

                  {/* Express - Asgabat - Gluten we Beylekiler */}
                  {selectedDeliveryType === 3 &&
                    selectedRegion === 1 &&
                    hasOnlyGlutenProducts === false && (
                      <>
                        {orderCities?.find(
                          (city) => city?.id === selectedRegion
                        )?.price *
                          2 +
                          (glutenPrice > 0 ? glutenPrice * 2 : 0) +
                          " M"}
                      </>
                    )}

                  {/* Express - Basgalar - Gluten we Beylekiler */}
                  {selectedDeliveryType === 3 &&
                    selectedRegion !== 1 &&
                    hasOnlyGlutenProducts === false && (
                      <>
                        {orderCities?.find(
                          (city) => city?.id === selectedRegion
                        )?.price *
                          2 +
                          (glutenPrice > 0
                            ? orderCities?.find(
                                (city) => city?.id === selectedRegion
                              )?.price * 2
                            : 0) +
                          " M"}
                      </>
                    )}
                </CustomText>
              </View>
              <View className="border-b border-grey-200 dark:border-grey-700 flex-row items-center justify-between mb-1 pb-2">
                <CustomText classes="font-nbold dark:text-grey-200">
                  {t.orderSum}
                </CustomText>
                <CustomText classes="font-nbold dark:text-white">
                  {/* Asgabat - Dine Gluten */}
                  {selectedDeliveryType === 1 &&
                    selectedRegion === 1 &&
                    hasOnlyGlutenProducts &&
                    (parseFloat(totalSum) + glutenPrice || 0).toFixed(2)}

                  {/* Beylekiler - Dine Gluten */}
                  {selectedDeliveryType === 1 &&
                    selectedRegion !== 1 &&
                    hasOnlyGlutenProducts &&
                    (
                      parseFloat(totalSum) +
                      (orderCities?.find((city) => city?.id === selectedRegion)
                        ?.price || 0)
                    ).toFixed(2)}

                  {/* Asgabat - Gluten we Beylekiler*/}
                  {selectedDeliveryType === 1 &&
                    selectedRegion === 1 &&
                    hasOnlyGlutenProducts === false &&
                    (
                      parseFloat(totalSum) +
                      (orderCities?.find((city) => city?.id === selectedRegion)
                        ?.price + glutenPrice || 0)
                    ).toFixed(2)}

                  {/* Basgalar - Gluten we beylekiler*/}
                  {selectedDeliveryType === 1 &&
                    selectedRegion !== 1 &&
                    hasOnlyGlutenProducts === false &&
                    (
                      parseFloat(totalSum) +
                      (orderCities?.find((city) => city?.id === selectedRegion)
                        ?.price +
                        (glutenPrice > 0
                          ? orderCities?.find(
                              (city) => city?.id === selectedRegion
                            )?.price
                          : 0) || 0)
                    ).toFixed(2)}

                  {/* Baryp almak */}
                  {selectedDeliveryType === 2 &&
                    parseFloat(totalSum).toFixed(2)}

                  {/* Express Asgabat - Dine Gluten */}
                  {selectedDeliveryType === 3 &&
                    selectedRegion === 1 &&
                    hasOnlyGlutenProducts && (
                      <>{parseFloat(totalSum + glutenPrice * 2).toFixed(2)}</>
                    )}

                  {/* Express Basgalar - Dine Gluten */}
                  {selectedDeliveryType === 3 &&
                    selectedRegion !== 1 &&
                    hasOnlyGlutenProducts &&
                    (
                      parseFloat(totalSum) +
                      (orderCities?.find((city) => city?.id === selectedRegion)
                        ?.price * 2 || 0)
                    ).toFixed(2)}

                  {/* Express Ashgabat - Gluten we beylekiler*/}
                  {selectedDeliveryType === 3 &&
                    selectedRegion === 1 &&
                    hasOnlyGlutenProducts === false &&
                    (
                      parseFloat(totalSum) +
                      (orderCities?.find((city) => city?.id === selectedRegion)
                        ?.price *
                        2 +
                        (glutenPrice > 0 ? glutenPrice * 2 : 0) || 0)
                    ).toFixed(2)}

                  {/* Express Basgalar - Gluten we beylekiler*/}
                  {selectedDeliveryType === 3 &&
                    selectedRegion !== 1 &&
                    hasOnlyGlutenProducts === false &&
                    (
                      parseFloat(totalSum) +
                      (orderCities?.find((city) => city?.id === selectedRegion)
                        ?.price *
                        2 +
                        (glutenPrice > 0
                          ? orderCities?.find(
                              (city) => city?.id === selectedRegion
                            )?.price * 2
                          : 0))
                    ).toFixed(2)}
                </CustomText>
              </View>
              {glutenPrice ? (
                <View className="bg-green-600 rounded-lg p-1">
                  <CustomText classes="font-nbold text-white">
                    {t.glutenProducts} :
                  </CustomText>
                  <View className="flex-row items-center justify-between">
                    <CustomText classes="text-white">
                      {t.productsSum}
                    </CustomText>
                    <CustomText classes="font-nbold text-white">
                      {parseFloat(glutenProductsPrice).toFixed(2)} M
                    </CustomText>
                  </View>
                  <View className="flex-row items-center justify-between h">
                    <CustomText classes="text-white">
                      {t.deliveryPrice}
                    </CustomText>
                    <CustomText classes="font-nbold text-white">
                      {/* Dostawka Asgabat */}
                      {selectedDeliveryType === 1 && selectedRegion === 1 && (
                        <>{parseFloat(glutenPrice || 0).toFixed(2)} M</>
                      )}

                      {/* Dostawka Basgalar */}
                      {selectedDeliveryType === 1 && selectedRegion !== 1 && (
                        <>
                          {(orderCities?.find(
                            (city) => city?.id === selectedRegion
                          )?.price || 0) + " M"}
                        </>
                      )}

                      {/* Baryp almak */}
                      {selectedDeliveryType === 2 && "0 M"}

                      {/* Express Asgabat */}
                      {selectedDeliveryType === 3 && selectedRegion === 1 && (
                        <>{parseFloat(glutenPrice * 2).toFixed(2)} M</>
                      )}

                      {/* Express Basgalar */}
                      {selectedDeliveryType === 3 && selectedRegion !== 1 && (
                        <>
                          {(orderCities?.find(
                            (city) => city?.id === selectedRegion
                          )?.price * 2 || 0) + " M"}
                        </>
                      )}
                    </CustomText>
                  </View>
                </View>
              ) : (
                <></>
              )}
            </View>
            <ScrollView className="mb-2" showsVerticalScrollIndicator={false}>
              {selectedDeliveryType === 2 ? (
                <></>
              ) : (
                <Pressable
                  onPress={() => setOrderRegionModalIsVisible(true)}
                  className={`${
                    selectedRegion
                      ? "bg-primary border-primary"
                      : "bg-grey-50 dark:bg-dark-primary border-grey-200 dark:border-transparent"
                  } border rounded-xl flex justify-center items-center mt-2 h-11 w-full`}
                >
                  <>
                    {selectedRegion ? (
                      <>
                        {language === "tm" ? (
                          <CustomText classes="font-nsemibold text-white">
                            {orderCities?.find(
                              (city) => city?.id === selectedRegion
                            )?.nameTm + " "}
                            {orderCities?.find(
                              (city) => city?.id === selectedRegion
                            )?.price + " M"}
                          </CustomText>
                        ) : (
                          <View className="flex-row items-center">
                            <CustomText classes="font-nsemibold text-white">
                              {orderCities?.find(
                                (city) => city?.id === selectedRegion
                              )?.nameRu + " "}
                              {orderCities?.find(
                                (city) => city?.id === selectedRegion
                              )?.price + " M"}
                            </CustomText>
                            <Image
                              source={icons.checkbox}
                              contentFit="contain"
                              className="mb-1 ml-2 h-4 w-4"
                              tintColor="#ffffff"
                            />
                          </View>
                        )}
                      </>
                    ) : (
                      <View className="flex-row items-center">
                        <CustomText classes="font-nsemibold text-red">
                          <CustomText classes="text-red font-nbold">
                            *{" "}
                          </CustomText>
                          {t.deliveryRegion}
                        </CustomText>
                        <Image
                          source={icons.chevronDown}
                          contentFit="contain"
                          className="h-6 w-6"
                          tintColor="#ff5959"
                        />
                      </View>
                    )}
                  </>
                </Pressable>
              )}
              <>
                <CustomText classes="text-dark-accent dark:text-grey-200 my-1">
                  <CustomText classes="text-red font-nbold">* </CustomText>
                  {t.deliveryType}
                </CustomText>
                <View className="bg-grey-50 dark:bg-dark-primary border border-grey-200 dark:border-transparent rounded-xl flex-row items-center justify-between">
                  {deliveryTypes?.map((item) => (
                    <View
                      className={
                        deliveryTypes?.length === 3
                          ? "w-1/3"
                          : deliveryTypes?.length === 2
                          ? "w-1/2"
                          : "w-full"
                      }
                      key={item.id}
                    >
                      <Pressable
                        onPress={() => {
                          setSelectedDeliveryType(item.id);
                        }}
                        className={`rounded-xl flex flex-row justify-center items-center h-11 w-full ${
                          selectedDeliveryType === item?.id ? "bg-primary" : ""
                        }`}
                      >
                        <CustomText
                          classes={`${
                            selectedDeliveryType === item?.id
                              ? "text-white font-nbold"
                              : "text-dark-primary dark:text-white"
                          }`}
                        >
                          {language === "tm" ? item?.nameTm : item?.nameRu}
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
              <>
                {selectedDeliveryType === 1 && (
                  <>
                    <CustomText classes="text-dark-primary dark:text-grey-200 my-1">
                      <CustomText classes="text-red font-nbold">* </CustomText>
                      {t.deliveryTime}
                    </CustomText>
                    <View className="rounded-xl flex-row flex-wrap justify-between items-center space-y-2">
                      {availableOrderTimes?.map((item) => (
                        <View className="w-[48%]" key={item.id}>
                          <Pressable
                            onPress={() => setSelectedDate(item.id)}
                            className={`border rounded-xl flex justify-center items-center h-11 w-full ${
                              selectedDate === item.id
                                ? "border-primary bg-primary"
                                : "border-grey-200 dark:border-transparent bg-grey-50 dark:bg-dark-primary"
                            }`}
                          >
                            <CustomText
                              classes={`font-nsemibold ${
                                selectedDate === item.id
                                  ? "text-white"
                                  : "text-dark-accent dark:text-grey-200"
                              }`}
                            >
                              {language === "tm" ? item?.nameTm : item?.nameRu}
                            </CustomText>
                            <CustomText
                              classes={`font-nsemibold ${
                                selectedDate === item.id
                                  ? "text-white"
                                  : "text-dark-accent dark:text-grey-200"
                              }`}
                            >
                              {item.time}
                            </CustomText>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </>
                )}
                {selectedDeliveryType === 2 && (
                  <View className="border-b border-grey-200 dark:border-grey flex-row justify-between items-center min-h-[44px] w-full">
                    <CustomText
                      classes="text-dark-accent dark:text-grey-200 font-nbold w-full"
                      numberOfLines={10}
                    >
                      {language === "tm"
                        ? otherInfo?.addressTm
                        : otherInfo?.addressRu}
                    </CustomText>
                  </View>
                )}
                {selectedDeliveryType === 3 && (
                  <View className="border-b border-grey-200 dark:border-grey flex-row justify-between items-center min-h-[44px] w-full">
                    <CustomText
                      classes="text-dark-accent dark:text-grey-200 font-nbold w-full"
                      numberOfLines={10}
                    >
                      {language === "tm"
                        ? otherInfo?.expressInfoTm
                        : otherInfo?.expressInfoRu}
                    </CustomText>
                  </View>
                )}
              </>
              <>
                <CustomText classes="text-dark-accent dark:text-grey-200 my-1">
                  <CustomText classes="text-red font-nbold">* </CustomText>
                  {t.paymentType}
                </CustomText>
                <View className="bg-grey-50 dark:bg-dark-primary border border-grey-200 dark:border-transparent rounded-xl flex-row items-center justify-between w-full">
                  {sortedPaymentTypes?.map((item) => (
                    <View
                      className={
                        paymentTypes?.length === 3
                          ? "w-1/3"
                          : paymentTypes?.length === 2
                          ? "w-1/2"
                          : "w-full"
                      }
                      key={item.id}
                    >
                      <Pressable
                        onPress={() => setSelectedPaymentType(item.id)}
                        className={`rounded-xl flex flex-row justify-center items-center h-11 w-full ${
                          selectedPaymentType === item.id ? "bg-primary" : ""
                        }`}
                      >
                        <CustomText
                          classes={`${
                            selectedPaymentType === item.id
                              ? "text-white text-center font-nsemibold px-1"
                              : "text-dark-primary dark:text-grey-200 text-center font-nsemibold px-1"
                          }`}
                          numberOfLines={2}
                        >
                          {language === "tm" ? item?.nameTm : item?.nameRu}
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
              {useCustomerData?.phoneNumber && (
                <>
                  <View className="flex-row items-center my-1">
                    <CustomText classes="text-base text-dark-accent dark:text-grey-200">
                      {t.pointsEarned}
                      {" : "}
                    </CustomText>
                    <CustomText classes="text-base text-primary font-nbold">
                      {availablePoints}
                    </CustomText>
                  </View>
                  <FormField
                    containerClasses="w-full"
                    value={form.payPoints}
                    handleChangeText={(e) => setForm({ ...form, payPoints: e })}
                    placeholder={
                      language === "tm"
                        ? "Ballar bilen töleg mukdary"
                        : "Кол.во баллов для оплаты"
                    }
                    placeholderTextColor="#a4a4a4"
                    isNumberField={true}
                    maxLength={8}
                  />
                </>
              )}
              <View className="my-2">
                <FormField
                  important={true}
                  title={t.username}
                  containerClasses="w-full"
                  value={form.username}
                  handleChangeText={(e) => setForm({ ...form, username: e })}
                  isPhoneNumberField={false}
                  placeholder={t.username}
                  placeholderTextColor="#a4a4a4"
                />
                <FormField
                  important={true}
                  title={t.phoneNumber}
                  containerClasses="w-full"
                  value={form.phoneNumber}
                  handleChangeText={(e) => setForm({ ...form, phoneNumber: e })}
                  isPhoneNumberField={true}
                  placeholder={t.phoneNumber}
                  placeholderTextColor="#a4a4a4"
                  maxLength={8}
                />
              </View>
              {selectedDeliveryType !== 2 ? (
                <>
                  {useCustomerData?.AddressOne && (
                    <View>
                      <CustomText classes="text-dark-accent dark:text-grey-200 mb-2">
                        {t.selectAddress}
                      </CustomText>
                      <View className="bg-grey-50 dark:bg-dark-primary border border-grey-200 dark:border-transparent rounded-xl relative space-y-1 items-center p-1 mb-2 w-full">
                        {getSavedAddresses()?.map((item) => (
                          <View className="w-full" key={item.id}>
                            <Pressable
                              onPress={() => {
                                setSelectedAddress(item.id);
                                handleAddressChange(
                                  "street",
                                  item?.address?.street
                                );
                                handleAddressChange(
                                  "house",
                                  item?.address?.house
                                );
                                handleAddressChange(
                                  "entrance",
                                  item?.address?.entrance
                                );
                                handleAddressChange(
                                  "roof",
                                  item?.address?.roof
                                );
                                handleAddressChange(
                                  "room",
                                  item?.address?.room
                                );
                              }}
                              className={`rounded-xl flex flex-row items-center justify-between active:opacity-80 py-2 px-4 min-h-[48px] w-full ${
                                selectedAddress === item?.id
                                  ? `${item?.color}`
                                  : "bg-white dark:bg-dark-accent"
                              }`}
                            >
                              <View className="w-72">
                                <CustomText classes="font-nbold text-dark-primary dark:text-white">
                                  {item?.title}
                                </CustomText>
                                <CustomText
                                  classes="text-sm text-dark-accent dark:text-white font-nsemibold"
                                  numberOfLines={20}
                                >
                                  {formatAddress(item?.address)}
                                </CustomText>
                              </View>
                              <Image
                                source={icons.checkbox}
                                contentFit="contain"
                                className="absolute right-4 h-4 w-4"
                                tintColor={
                                  colorScheme === "dark" ? "#343a46" : "#ffffff"
                                }
                              />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  <>
                    <FormField
                      title={t.addressStreet}
                      important={true}
                      containerClasses="min-h-[90px] w-full"
                      value={form.address.street}
                      handleChangeText={(value) =>
                        handleAddressChange("street", value)
                      }
                      placeholder={t.addressStreet}
                      placeholderTextColor="#a4a4a4"
                      isMultiline={true}
                      numberOfLines={4}
                      verticalAlign="top"
                    />
                    <FormField
                      title={t.addressHouse}
                      important={true}
                      containerClasses="mt-2 w-full"
                      value={form.address.house}
                      handleChangeText={(value) =>
                        handleAddressChange("house", value)
                      }
                      placeholder={t.addressHouse}
                      placeholderTextColor="#a4a4a4"
                    />
                    <FormField
                      title={t.addressEntrance}
                      containerClasses="mt-2 w-full"
                      value={form.address.entrance}
                      handleChangeText={(value) =>
                        handleAddressChange("entrance", value)
                      }
                      placeholder={t.addressEntrance}
                      placeholderTextColor="#a4a4a4"
                    />
                    <FormField
                      title={t.addressRoof}
                      containerClasses="mt-2 w-full"
                      value={form.address.roof}
                      handleChangeText={(value) =>
                        handleAddressChange("roof", value)
                      }
                      placeholder={t.addressRoof}
                      placeholderTextColor="#a4a4a4"
                    />
                    <FormField
                      title={t.addressRoom}
                      containerClasses="mt-2 w-full"
                      value={form.address.room}
                      handleChangeText={(value) =>
                        handleAddressChange("room", value)
                      }
                      placeholder={t.addressRoom}
                      placeholderTextColor="#a4a4a4"
                    />
                  </>
                </>
              ) : (
                <></>
              )}
              <FormField
                title={language === "tm" ? "Bellikler" : "Заметки"}
                containerClasses="mt-2 w-full"
                value={form.comment}
                handleChangeText={(e) => setForm({ ...form, comment: e })}
                placeholder={language === "tm" ? "Bellikler" : "Заметки"}
                placeholderTextColor="#a4a4a4"
                isMultiline={true}
                numberOfLines={4}
                verticalAlign="top"
              />
              <View className="mt-2">
                <CustomText classes="text-dark-accent dark:text-grey-200">
                  {t.courierLang}
                </CustomText>
                <View className="bg-grey-50 dark:bg-dark-primary border border-grey-300 dark:border-transparent rounded-xl flex-row items-center justify-between mt-2 w-full">
                  {couriers?.map((item) => (
                    <View
                      className={couriers?.length === 3 ? "w-1/3" : "w-1/2"}
                      key={item.id}
                    >
                      <Pressable
                        onPress={() => {
                          setSelectedCourier(item.id);
                        }}
                        className={`rounded-xl flex flex-row justify-center items-center h-11 w-full ${
                          selectedCourier === item.id ? "bg-primary" : ""
                        }`}
                      >
                        <CustomText
                          classes={`${
                            selectedCourier === item.id
                              ? "text-white font-nbold"
                              : "text-dark-accent dark:text-grey-200"
                          }`}
                        >
                          {language === "tm" ? item?.nameTm : item?.nameRu}
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
              <Pressable
                onPress={checkStockAndProceed}
                className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 mt-2 mb-8 px-8 h-11"
                disabled={submitting}
              >
                <CustomText classes="font-nbold text-white text-base mr-1">
                  {t.makeOrder}
                </CustomText>
                {submitting && (
                  <ActivityIndicator
                    animating={submitting}
                    color="#ffffff"
                    size="small"
                  />
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
