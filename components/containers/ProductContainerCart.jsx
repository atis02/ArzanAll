import { icons } from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { apiURL } from "../../utils/utils";
import { useUnregCustomerStore } from "../../utils/useUnregCustomerStore";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { throwToast } from "../../utils/Toaster";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { View, Pressable, Modal } from "react-native";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";

export default function ProductContainerCart({ product }) {
  const [stockLimitVisible, setStockLimitVisible] = useState(false);
  const [orderLimitVisible, setOrderLimitVisible] = useState(false);
  const {
    barcode,
    nameTm,
    nameRu,
    quantity: initialQuantity,
    currentSellPrice,
  } = product;
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { shoppingCart, setShoppingCartQuantity, removeFromShoppingCart } =
    useUnregCustomerStore();
  const [quantity, setQuantity] = useState(initialQuantity);
  const { colorScheme } = useColorScheme();
  const imageUrl = product.imageOne ? `${apiURL}/${product.imageOne}` : null;

  useEffect(() => {
    const cartItem = shoppingCart.find((item) => item.barcode === barcode);
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }
  }, [shoppingCart]);

  const productInCart = shoppingCart.find(
    (item) => item?.barcode === product?.barcode
  );

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      removeFromShoppingCart(barcode);
      throwToast(t.quantityChanged);
    } else {
      setShoppingCartQuantity(barcode, Number(newQuantity));
      setQuantity(Number(newQuantity));
      throwToast(t.quantityChanged);
    }
  };

  const increaseQuantity = () => {
    const newQuantity = (productInCart?.quantity || 0) + 1;

    if (product?.limit > 0 && newQuantity > product?.limit) {
      setOrderLimitVisible(true);
    } else if (newQuantity > product?.stock) {
      setStockLimitVisible(true);
      throwToast(t.quantityChanged);
    } else {
      setShoppingCartQuantity(product?.barcode, newQuantity);
      setQuantity(newQuantity);
      throwToast(t.quantityChanged);
    }
  };

  const handleRemoveProduct = () => {
    removeFromShoppingCart(barcode);
    throwToast(t.quantityChanged);
  };

  return (
    <View className="bg-white dark:bg-dark-accent border border-grey-200 dark:border-transparent rounded-xl p-1 w-full">
      <View className="flex-row items-center">
        <Pressable className="bg-white border-r border-grey-200 dark:border-dark-primary dark:rounded-xl mr-2 pr-1 dark:pr-0 h-20 w-20">
          <Image
            source={imageUrl || icons.placeholder}
            contentFit="cover"
            className="rounded-xl h-full w-full"
            placeholder={icons.placeholder}
            placeholderContentFit="contain"
          />
        </Pressable>
        <View className="justify-between grow h-24">
          <View className="flex-row h-10">
            <Pressable
              onPress={() => router.navigate(`/${product?.barcode}`)}
              className="flex-row items-center active:opacity-70"
            >
              <CustomText
                classes="text-xs text-dark-primary dark:text-white max-w-[210px]"
                numberOfLines={2}
              >
                {language === "tm" ? nameTm : nameRu}
              </CustomText>
            </Pressable>
            <Pressable
              className="justify-center items-center active:opacity-50 ml-auto h-10 w-10"
              onPress={handleRemoveProduct}
            >
              <Image
                source={icons.cross}
                contentFit="contain"
                className="h-6 w-6"
                transition={100}
                tintColor="#ff5959"
              />
            </Pressable>
          </View>
          <View className="flex-row items-center justify-between h-10">
            <View className="justify-between h-full min-w-[48px]">
              <CustomText classes="text-xs text-dark-primary dark:text-white">
                {t.price}
              </CustomText>
              <CustomText classes="text-primary font-nbold">
                {parseFloat(currentSellPrice)?.toFixed(2)}
              </CustomText>
            </View>
            <View className="justify-between h-full">
              <View className="bg-grey-100 dark:bg-dark-primary rounded-xl flex-row justify-between items-center mt-auto h-full">
                <Pressable
                  onPress={() => handleQuantityChange(quantity - 1)}
                  className="items-center justify-center rounded-full active:opacity-50 h-8 w-6"
                >
                  <Image
                    source={icons.minus}
                    contentFit="contain"
                    className="h-7 w-7"
                    tintColor={colorScheme === "dark" ? "#f7f7f7" : "#1b1c1d"}
                  />
                </Pressable>
                <View className="bg-white dark:bg-dark-accent border border-grey-200 dark:border-grey-700 rounded-xl items-center justify-center h-9 w-20">
                  <CustomText classes="font-nbold text-dark-accent dark:text-grey-200">
                    {product?.unit === "Piece" ? (
                      <>
                        {quantity}{" "}
                        <CustomText classes="text-[10px]">
                          {language === "tm"
                            ? product?.Unit?.nameTm
                            : product?.Unit?.nameRu}
                        </CustomText>
                      </>
                    ) : (
                      <>
                        {quantity >= 1 ? (
                          <>{parseFloat(quantity).toFixed(2)}</>
                        ) : (
                          <>{parseFloat(quantity).toFixed(3)}</>
                        )}{" "}
                        <CustomText classes="text-[10px]">
                          {language === "tm" ? "kg." : "кг."}
                        </CustomText>
                      </>
                    )}
                  </CustomText>
                </View>
                <Pressable
                  onPress={() => increaseQuantity()}
                  className="items-center justify-center rounded-full active:opacity-50 h-8 w-6"
                >
                  <Image
                    source={icons.plus}
                    contentFit="contain"
                    className="h-7 w-7"
                    tintColor={colorScheme === "dark" ? "#f7f7f7" : "#1b1c1d"}
                  />
                </Pressable>
              </View>
            </View>
            <View className="items-end justify-between h-full min-w-[64px] max-w-20">
              <CustomText classes="text-xs text-dark-primary dark:text-white">
                {t.sum}
              </CustomText>
              <CustomText classes="text-primary font-nbold">
                {parseFloat(currentSellPrice * quantity).toFixed(2)}
              </CustomText>
            </View>
          </View>
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={stockLimitVisible}
      >
        <View className="flex-1 items-center justify-center">
          <View className="bg-grey-50 border border-grey-200 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <CustomText classes="font-nbold text-dark-primary text-base">
              {t.stockHeader}
            </CustomText>
            <CustomText numberOfLines={2}>
              {t.stockChangeText} {parseFloat(product?.stock).toFixed(2)} .
            </CustomText>
            <Pressable
              onPress={() => setStockLimitVisible(false)}
              className="border border-grey-300 rounded-xl items-center justify-center mt-2 active:opacity-50 h-12 w-full"
            >
              <CustomText classes="font-nsemibold text-base text-dark-primary">
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
      >
        <View className="flex-1 items-center justify-center">
          <View className="bg-grey-50 border border-grey-200 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <CustomText classes="font-nbold text-dark-primary text-lg">
              {t.orderLimitHeader}
            </CustomText>
            <CustomText numberOfLines={2}>
              {t.orderLimitText} ({product?.limit}).
            </CustomText>
            <Pressable
              onPress={() => setOrderLimitVisible(false)}
              className="border border-grey-300 rounded-xl items-center justify-center mt-2 active:opacity-50 h-12 w-full"
            >
              <CustomText classes="font-nsemibold text-base text-dark-primary">
                OK
              </CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
