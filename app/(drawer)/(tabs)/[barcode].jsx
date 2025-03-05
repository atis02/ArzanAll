import Carousel from "react-native-reanimated-carousel";
import ZoomImage from "../../../components/containers/ZoomImage";
import { icons } from "../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../utils/utils";
import { useLanguageStore } from "../../../utils/useLanguageStore";
import { useFetcher } from "../../../utils/useFetcher";
import { CustomText } from "../../../utils/CustomText";
import { throwToast } from "../../../utils/Toaster";
import { useCustomerStore } from "../../../utils/useCustomerStore";
import { useUnregCustomerStore } from "../../../utils/useUnregCustomerStore";
import { AddToWishlist } from "../../../components/functions/AddToWishlist";
import { Dropdown } from "react-native-element-dropdown";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useState } from "react";
import {
  View,
  Pressable,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";

const screenWidth = Dimensions.get("screen").width;

const units = [
  {
    id: 1,
    nameTm: "Kg.",
    nameRu: "Кг.",
  },
  {
    id: 2,
    nameTm: "Gr.",
    nameRu: "Гр.",
  },
];

const renderItem = (item) => {
  return (
    <View className="rounded-xl items-center justify-center h-12 w-16">
      <CustomText>{item.label}</CustomText>
    </View>
  );
};

const QuantityDropdown = ({
  productInCart,
  unitType,
  language,
  data,
  value,
  onChange,
}) => {
  const displayQuantity =
    unitType === 1
      ? `${parseFloat(productInCart?.quantity).toFixed(2)} ${
          language === "tm" ? "kg." : "кг."
        }`
      : `${parseFloat(productInCart?.quantity).toFixed(3)} ${
          language === "tm" ? "gr." : "гр."
        }`;

  return (
    <Dropdown
      data={data}
      valueField="value"
      labelField="label"
      placeholder={displayQuantity}
      value={value}
      onChange={onChange}
      renderLeftIcon={() => (
        <CustomText classes="text-white font-nsemibold">
          {displayQuantity}
        </CustomText>
      )}
      renderItem={renderItem}
      iconStyle={{ tintColor: "white" }}
      dropdownPosition="top"
      dropdownStyle={{
        maxHeight: 300,
        overflow: "scroll",
        zIndex: 1,
      }}
      activeColor="#f3f2f7"
      containerStyle={{
        borderRadius: 12,
        width: 64,
        borderColor: "#ff9700",
        borderWidth: 2,
      }}
      autoScroll={false}
    />
  );
};

const PiecesDropdown = ({ productInCart, data, value, onChange }) => {
  const displayQuantity = productInCart.quantity;

  return (
    <Dropdown
      data={data}
      valueField="value"
      labelField="label"
      placeholder={displayQuantity}
      value={value}
      onChange={onChange}
      renderLeftIcon={() => (
        <CustomText classes="text-white font-nsemibold">
          {displayQuantity}
        </CustomText>
      )}
      renderItem={renderItem}
      iconStyle={{ tintColor: "white" }}
      dropdownPosition="top"
      dropdownStyle={{
        maxHeight: 300,
        overflow: "scroll",
        zIndex: 1,
        width: 40,
      }}
      activeColor="#f3f2f7"
      containerStyle={{
        display: "flex",
        justifyContent: "center",
        borderRadius: 12,
        width: 64,
        borderColor: "#ff9700",
        borderWidth: 2,
      }}
      autoScroll={false}
    />
  );
};

const getDropdownData = (productData) => {
  const stock = parseInt(productData.stock, 10);
  const limit = parseInt(productData.limit, 10);

  const maxValue = limit > 0 ? Math.min(stock, limit) : stock;

  const dropdownData = [];
  for (let i = 1; i <= maxValue; i++) {
    dropdownData.push({ label: i.toString(), value: i });
  }

  return dropdownData;
};

export default function ProductScreen() {
  const { barcode } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [orderLimitVisible, setOrderLimitVisible] = useState(false);
  const [stockLimitModal, setStockLimitModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewIsLoading, setReviewIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(1);
  const [unitType, setUnitType] = useState(1);
  const [selectedValue, setSelectedValue] = useState(null);
  const [zoomImageModal, setZoomImageModal] = useState(false);
  const { useCustomerData } = useCustomerStore();
  const {
    shoppingCart,
    addToShoppingCart,
    updateShoppingCartQuantity,
    removeFromShoppingCart,
    setShoppingCartQuantity,
  } = useUnregCustomerStore();
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();

  const {
    data: response = [],
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/products/barcode/${barcode}`);

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

  if (error)
    return (
      <View className="bg-white dark:bg-dark-primary items-center justify-center h-full">
        <CustomText classes="text-dark-accent dark:text-grey-200 text-lg">
          {t.networkError}
        </CustomText>
      </View>
    );

  const dropdownData = getDropdownData(response);

  const images = [
    response?.imageOne,
    response?.imageTwo,
    response?.imageThree,
    response?.imageFour,
    response?.imageFive,
  ].filter(Boolean);

  const productInCart = shoppingCart.find(
    (item) => item?.barcode === response?.barcode
  );

  const handleAddToCart = () => {
    if (response?.stock <= 0) {
      return;
    } else {
      const quantityToAdd = Math.min(1, response?.stock);
      addToShoppingCart(response, quantityToAdd);
      throwToast(t.quantityChanged);
    }
  };

  const increaseQuantity = () => {
    const increment = unitType === 1 ? 1 : 0.1;
    const newQuantity = (productInCart?.quantity || 0) + increment;

    if (response?.limit > 0 && newQuantity > response?.limit) {
      setOrderLimitVisible(true);
    } else if (newQuantity > response?.stock) {
      setStockLimitModal(true);
    } else {
      updateShoppingCartQuantity(response?.barcode, increment);
      throwToast(t.quantityChanged);
    }
  };

  const decreaseQuantity = () => {
    const decrement = unitType === 1 ? 1 : 0.1;
    const newQuantity = (productInCart?.quantity || 0) - decrement;

    const roundedQuantity = Math.round(newQuantity * 10) / 10;

    if (roundedQuantity <= 0) {
      removeFromShoppingCart(response?.barcode);
      throwToast(t.quantityChanged);
    } else {
      updateShoppingCartQuantity(response?.barcode, -decrement);
      throwToast(t.quantityChanged);
    }
  };

  const handleQuantityChange = (quantity) => {
    setShoppingCartQuantity(response?.barcode, quantity);
  };

  const canReviewProduct = async () => {
    if (!useCustomerData?.phoneNumber) {
      Alert.alert(t.canNotLeaveReviewHeader, t.signInOrUpForReview);
      return;
    }

    try {
      const response = await fetch(`${apiURL}/actions/review/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: useCustomerData?.id,
          barcode: barcode,
        }),
      });
      const data = await response.json();

      if (data?.canReviewProduct === false) {
        Alert.alert(t.canNotLeaveReviewHeader, t.buyBeforeReview);
        return;
      } else if (response.status === 400) {
        Alert.alert(t.canNotLeaveReviewHeader, t.youAlreadyHaveReviewed);
      } else {
        setReviewModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendProductReview = async () => {
    try {
      setReviewIsLoading(true);

      const response = await fetch(`${apiURL}/actions/product/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: useCustomerData?.id,
          barcode: response?.barcode,
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
    <KeyboardAvoidingView
      className="bg-white dark:bg-dark-primary px-4"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={{ flex: 1 }}
    >
      <View className="flex-row items-center h-14">
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
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex flex-col h-full"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="bg-transparent dark:bg-dark-accent rounded-xl items-center justify-center mb-2 h-72">
          {images?.length > 0 ? (
            <Carousel
              panGestureHandlerProps={{
                activeOffsetX: [-10, 10],
              }}
              loop={images.length > 1}
              height={288}
              width={screenWidth - 32}
              autoPlay={images.length > 1}
              autoPlayInterval={5000}
              scrollAnimationDuration={500}
              data={images}
              defaultIndex={0}
              renderItem={({ index }) => (
                <View className="border border-grey-200 dark:border-transparent rounded-xl items-center justify-center relative">
                  <Pressable
                    onPress={() => {
                      setZoomImageModal(true);
                      setCurrentImage(index);
                    }}
                    className="h-full w-full"
                  >
                    <Image
                      source={{ uri: `${apiURL}/${images[index]}` }}
                      className="rounded-xl h-full w-full"
                      contentFit="contain"
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setZoomImageModal(true);
                      setCurrentImage(index);
                    }}
                    className="bg-grey rounded-bl-xl rounded-tr-xl flex-row items-center justify-center active:opacity-70 absolute right-0 top-0 px-2 h-10 z-10"
                  >
                    <Image
                      source={icons.zoom}
                      contentFit="contain"
                      className="h-6 w-6"
                      tintColor="#ffffff"
                    />
                  </Pressable>
                </View>
              )}
            />
          ) : (
            <Image
              source={icons.image}
              className="bg-white dark:bg-dark-accent rounded-xl h-32 w-32"
              contentFit="contain"
              tintColor="#a4a4a4"
            />
          )}
        </View>
        <View className="bg-grey-50 dark:bg-dark-accent rounded-xl p-2">
          <View className="flex-row items-center justify-between mb-2">
            <CustomText
              classes="text-left text-base text-primary font-nsemibold"
              numberOfLines={20}
            >
              {language === "tm" ? response?.nameTm : response?.nameRu}
            </CustomText>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <CustomText classes="font-nbold text-dark-accent dark:text-grey-200">
              {t.barcode} : {response?.barcode}
            </CustomText>
            <AddToWishlist product={response} />
          </View>
          {response?.descriptionTm || response?.descriptionRu ? (
            <View className="flex-row mb-2">
              <CustomText
                classes="text-left text-dark-accent dark:text-grey-200"
                numberOfLines={100}
              >
                <CustomText classes="font-nbold">
                  {t.aboutProduct} :{" "}
                </CustomText>
                {language === "tm"
                  ? response?.descriptionTm
                  : response?.descriptionRu}
              </CustomText>
            </View>
          ) : (
            <></>
          )}
          <View className="border-t border-grey-200 dark:border-grey pt-2">
            <View className="mb-2">
              <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center w-[45%]">
                  <CustomText classes="font-nbold text-dark-accent dark:text-grey-200">
                    {t.averageRating} :
                  </CustomText>
                  <CustomText classes="text-base text-primary font-nbold">
                    {" "}
                    {response?.averageRating || 5}
                  </CustomText>
                </View>
                <Pressable
                  onPress={() => canReviewProduct()}
                  className="bg-primary rounded-xl flex-row items-center justify-center active:bg-primary-600 h-11 w-[40%]"
                >
                  <View>
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <></>
                    )}
                  </View>
                  <CustomText classes="text-white ml-1">
                    {t.leaveReview}
                  </CustomText>
                </Pressable>
              </View>
            </View>
            <View className="bg-white dark:bg-dark-secondary rounded-xl py-2 mb-2">
              {response?.Reviews?.length > 0 ? (
                <>
                  {response?.Reviews?.map((item) => {
                    return (
                      <View
                        key={item?.id}
                        className="border-b border-grey-200 dark:border-grey mb-2 p-2 w-full"
                      >
                        <View className="flex-row items-center mb-2">
                          <View className="bg-grey-100 dark:bg-dark-accent border border-grey-200 dark:border-transparent rounded-xl justify-center items-center h-8 w-8">
                            <Image
                              source={icons.user}
                              contentFit="contain"
                              className="h-4 w-4"
                              tintColor={
                                colorScheme === "light" ? "#1b1c1d" : "#a4a4a4"
                              }
                            />
                          </View>
                          <CustomText classes="text-dark-primary dark:text-grey-200 ml-2">
                            {item?.Customer?.username
                              ? item?.Customer?.username
                              : t.anonymous}
                          </CustomText>
                          <View className="flex-row items-center ml-auto">
                            {Array.from({ length: item.rating }).map(
                              (_, index) => (
                                <Image
                                  key={index}
                                  source={icons.star}
                                  contentFit="contain"
                                  className="h-4 w-4 ml-1"
                                  tintColor="#fdda0d"
                                />
                              )
                            )}
                          </View>
                        </View>
                        <CustomText
                          classes="font-nsemibold text-dark-primary dark:text-grey-200 text-left"
                          numberOfLines={100}
                        >
                          {item.comment}
                        </CustomText>
                        {item?.reply ? (
                          <>
                            <View className="flex-row items-center mt-2 ml-auto">
                              <CustomText classes="text-dark-primary dark:text-grey-200 mr-2">
                                {t.administration}
                              </CustomText>
                              <View className="bg-grey-100 dark:bg-dark-accent border border-grey-200 dark:border-transparent rounded-xl justify-center items-center h-8 w-8">
                                <Image
                                  source={icons.logoNoText}
                                  contentFit="contain"
                                  className="h-4 w-4"
                                />
                              </View>
                            </View>
                            <CustomText
                              classes="font-nsemibold text-dark-primary dark:text-grey-200 text-right"
                              numberOfLines={40}
                            >
                              {item.reply}
                            </CustomText>
                          </>
                        ) : (
                          <></>
                        )}
                      </View>
                    );
                  })}
                </>
              ) : (
                <View className="justify-center p-2">
                  <CustomText classes="text-dark-accent dark:text-grey-200">
                    {t.noReviewYet}
                  </CustomText>
                </View>
              )}
            </View>
          </View>
          {response?.unit === "Piece" ? (
            <View className="flex-row items-center mt-auto">
              <>
                {response?.discountValue &&
                parseFloat(response?.discountValue) > 0 ? (
                  <View className="flex-row items-center justify-between w-44">
                    <>
                      <CustomText classes="text-xl text-primary font-nbold">
                        {parseFloat(response?.currentSellPrice).toFixed(2)} M
                      </CustomText>
                      <CustomText classes="text-base text-grey-400 font-nbold line-through">
                        {parseFloat(response?.sellPrice).toFixed(2)} M
                      </CustomText>
                    </>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center">
                    <CustomText classes="text-xl text-primary font-nbold">
                      {parseFloat(response?.currentSellPrice).toFixed(2)} M
                    </CustomText>
                  </View>
                )}
              </>
              {productInCart ? (
                <View className="bg-primary rounded-xl flex flex-row justify-between items-center ml-auto h-11 w-40">
                  <Pressable
                    onPress={decreaseQuantity}
                    className="items-center justify-center rounded-full active:opacity-80 h-9 w-10"
                  >
                    <Image
                      source={icons.minus}
                      contentFit="contain"
                      className="h-6 w-6"
                      transition={100}
                      tintColor="#ffffff"
                    />
                  </Pressable>
                  <PiecesDropdown
                    productInCart={productInCart}
                    data={dropdownData}
                    value={selectedValue}
                    onChange={(item) => {
                      setSelectedValue(item?.value);
                      handleQuantityChange(item?.value);
                    }}
                  />
                  <Pressable
                    onPress={increaseQuantity}
                    className="items-center justify-center rounded-full active:opacity-80 h-9 w-10"
                  >
                    <Image
                      source={icons.plus}
                      contentFit="contain"
                      className="h-6 w-6"
                      transition={100}
                      tintColor="#ffffff"
                    />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handleAddToCart}
                  className="bg-primary rounded-xl flex-row justify-center items-center active:bg-primary-600 ml-auto h-11 w-40"
                >
                  <CustomText classes="text-white font-nsemibold">
                    {t.buy}
                  </CustomText>
                </Pressable>
              )}
            </View>
          ) : (
            <>
              {productInCart ? (
                <View className="flex-row items-center mb-2 h-11">
                  <View className="bg-primary rounded-xl flex flex-row justify-between items-center px-2 h-full w-44">
                    <Pressable
                      onPress={decreaseQuantity}
                      className="items-center justify-center rounded-full active:opacity-80 h-8 w-8"
                    >
                      <Image
                        source={icons.minus}
                        contentFit="contain"
                        className="h-7 w-7"
                        tintColor="#ffffff"
                      />
                    </Pressable>
                    <QuantityDropdown
                      productInCart={productInCart}
                      unitType={unitType}
                      language={language}
                      data={dropdownData}
                      value={selectedValue}
                      onChange={(item) => {
                        setSelectedValue(item.value);
                        handleQuantityChange(item.value);
                      }}
                    />
                    <Pressable
                      onPress={increaseQuantity}
                      className="items-center justify-center rounded-full active:opacity-80 h-8 w-8"
                    >
                      <Image
                        source={icons.plus}
                        contentFit="contain"
                        className="h-7 w-7"
                        tintColor="#ffffff"
                      />
                    </Pressable>
                  </View>
                  <View className="rounded-xl flex-row justify-between items-center ml-auto h-full w-40">
                    {units?.map((item) => (
                      <View className="rounded-xl h-11 w-[50%]" key={item.id}>
                        <Pressable
                          key={item.id}
                          onPress={() => setUnitType(item.id)}
                          className={`flex flex-row justify-center items-center h-full w-full ${
                            unitType === item.id
                              ? "border border-transparent bg-primary"
                              : "border border-grey-300 dark:border-transparent bg-white dark:bg-dark-secondary"
                          } ${
                            item.id === 1
                              ? "rounded-l-xl border-r-0"
                              : "rounded-r-xl border-l-0"
                          }`}
                        >
                          <CustomText
                            classes={`font-nsemibold ${
                              unitType === item?.id
                                ? "text-white"
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
              ) : (
                <></>
              )}
              <View className="flex-row">
                <>
                  {response?.discountValue &&
                  parseFloat(response?.discountValue) > 0 ? (
                    <View className="flex-row items-center justify-between h-11 w-44">
                      <>
                        <CustomText classes="text-xl text-primary font-nbold">
                          {parseFloat(response?.currentSellPrice).toFixed(2)} M
                        </CustomText>
                        <CustomText classes="text-base text-grey-400 font-nbold line-through">
                          {parseFloat(response?.sellPrice).toFixed(2)} M
                        </CustomText>
                      </>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <CustomText classes="text-xl text-primary font-nbold">
                        {parseFloat(response?.currentSellPrice).toFixed(2)} M
                      </CustomText>
                    </View>
                  )}
                </>
                {productInCart ? (
                  <Pressable className="bg-white dark:bg-dark-secondary border border-grey-300 dark:border-transparent rounded-xl flex-row justify-center items-center ml-auto h-11 w-40">
                    <CustomText classes="text-dark-accent dark:text-grey-200 font-nsemibold mr-2">
                      {t.inCart}
                    </CustomText>
                    <Image
                      source={icons.check}
                      contentFit="contain"
                      className="h-5 w-5"
                      tintColor={
                        colorScheme === "light" ? "#1b1c1d" : "#dfdfdf"
                      }
                    />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleAddToCart}
                    className="bg-primary rounded-xl flex-row justify-center items-center active:bg-primary-600 ml-auto h-11 w-40"
                  >
                    <CustomText classes="text-white font-nsemibold">
                      {t.buy}
                    </CustomText>
                  </Pressable>
                )}
              </View>
            </>
          )}
        </View>
        <View className="mb-4"></View>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={stockLimitModal}
        onRequestClose={() => setStockLimitModal(false)}
      >
        <View className="flex-1 items-center justify-center">
          <View className="bg-grey-50 dark:bg-dark-accent border border-grey-300 dark:border-grey-700 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <CustomText classes="font-nbold text-dark-primary dark:text-grey-200 text-base">
              {t.stockHeader}
            </CustomText>
            <CustomText
              classes="text-dark-primary dark:text-grey-200"
              numberOfLines={2}
            >
              {t.stockChangeText} {parseFloat(response?.stock).toFixed(2)} .
            </CustomText>
            <Pressable
              onPress={() => setStockLimitModal(false)}
              className="border border-grey-300 dark:border-grey-700 rounded-xl items-center justify-center mt-2 active:opacity-50 h-12 w-full"
            >
              <CustomText classes="font-nsemibold text-base text-dark-primary dark:text-grey-200">
                OK
              </CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={orderLimitVisible}
        onRequestClose={() => setOrderLimitVisible(false)}
      >
        <View className="flex-1 items-center justify-center">
          <View className="bg-grey-50 dark:bg-dark-accent border border-grey-300 dark:border-grey-700 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <CustomText classes="font-nbold text-dark-primary dark:text-grey-200 text-base">
              {t.orderLimitHeader}
            </CustomText>
            <CustomText
              classes="text-dark-primary dark:text-grey-200"
              numberOfLines={2}
            >
              {t.orderLimitText} ({response?.limit}).
            </CustomText>
            <Pressable
              onPress={() => setOrderLimitVisible(false)}
              className="border border-grey-300 dark:border-grey-700 rounded-xl items-center justify-center mt-2 active:opacity-50 h-12 w-full"
            >
              <CustomText classes="font-nsemibold text-base text-dark-primary dark:text-grey-200">
                OK
              </CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModal}
        onRequestClose={() => setReviewModal(false)}
      >
        <View className="flex-1 z-10">
          <View className="bg-grey-100 dark:bg-dark-secondary rounded-t-3xl relative p-4 mt-auto min-h-[70%] w-full">
            <View className="flex-row items-center justify-between mb-4">
              <CustomText classes="text-base text-primary font-nbold">
                {t.leaveReview}
              </CustomText>
              <Pressable
                onPress={() => {
                  setReviewModal(false);
                }}
                className="bg-white dark:bg-dark-accent border border-grey-300 dark:border-transparent rounded-xl items-center justify-center active:border-primary h-9 w-9"
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
              className="bg-white dark:bg-dark-primary rounded-xl font-nregular text-dark-primary dark:text-white text-base p-2"
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
                sendProductReview();
              }}
              className="bg-primary rounded-xl flex-row items-center justify-center active:bg-primary-600 mt-4 h-11"
              disabled={reviewIsLoading}
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={zoomImageModal}
        onRequestClose={() => setZoomImageModal(false)}
      >
        <GestureHandlerRootView>
          <Pressable
            onPress={() => {
              setZoomImageModal(false);
            }}
            className="bg-white flex-1 items-center justify-center"
          >
            <ZoomImage
              imageUrl={`${apiURL}/${images[currentImage]}`}
              onPress={() => setZoomImageModal(false)}
            />
          </Pressable>
        </GestureHandlerRootView>
      </Modal>
    </KeyboardAvoidingView>
  );
}
