import { icons } from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { throwToast } from "../../utils/Toaster";
import { useUnregCustomerStore } from "../../utils/useUnregCustomerStore";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { Image } from "expo-image";
import { useState } from "react";
import { View, Pressable, Modal } from "react-native";

export const AddToCartThree = ({ product }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [orderLimitVisible, setOrderLimitVisible] = useState(false);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();
  const {
    shoppingCart,
    addToShoppingCart,
    updateShoppingCartQuantity,
    removeFromShoppingCart,
  } = useUnregCustomerStore();

  const productInCart = shoppingCart.find(
    (item) => item?.barcode === product?.barcode
  );

  const handleAddToCart = () => {
    if (product?.stock <= 0) {
      return;
    } else {
      const quantityToAdd = Math.min(1, product.stock);
      addToShoppingCart(product, quantityToAdd);
      throwToast(t.quantityChanged);
    }
  };

  const increaseQuantity = () => {
    const newQuantity = (productInCart?.quantity || 0) + 1;

    if (product?.limit > 0 && newQuantity > product?.limit) {
      setOrderLimitVisible(true);
    } else if (newQuantity > product?.stock) {
      setModalVisible(true);
    } else {
      updateShoppingCartQuantity(product?.barcode, 1);
      throwToast(t.quantityChanged);
    }
  };

  const decreaseQuantity = () => {
    if (productInCart.quantity === 1) {
      removeFromShoppingCart(product?.barcode);
      throwToast(t.quantityChanged);
    } else {
      updateShoppingCartQuantity(product?.barcode, -1);
      throwToast(t.quantityChanged);
    }
  };

  return (
    <>
      {productInCart ? (
        <View className="bg-primary rounded-xl flex flex-row justify-between items-center ml-auto h-9 w-full">
          <Pressable
            onPress={decreaseQuantity}
            className="items-center justify-center rounded-full active:opacity-80 h-7 w-7"
          >
            <Image
              source={icons.minus}
              contentFit="contain"
              className="h-6 w-6"
              transition={100}
              tintColor="#ffffff"
            />
          </Pressable>
          <View className="items-center justify-center h-9 w-14">
            <CustomText classes="text-white font-nsemibold">
              {product?.unit === "Kg" || product?.unit === "Litre" ? (
                <>{parseFloat(productInCart?.quantity).toFixed(2)}</>
              ) : (
                <>{productInCart?.quantity}</>
              )}
            </CustomText>
          </View>
          <Pressable
            onPress={increaseQuantity}
            className="items-center justify-center rounded-full active:opacity-80 h-7 w-7"
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
          className="bg-primary rounded-xl flex-row justify-center items-center active:bg-primary-600 ml-auto h-9 w-full"
        >
          <CustomText classes="text-xs text-white font-nsemibold">
            {t.buy}
          </CustomText>
        </Pressable>
      )}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View className="flex-1 items-center justify-center">
          <View className="bg-grey-50 border border-grey-400 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <CustomText classes="font-nbold text-dark-primary text-base">
              {t.stockHeader}
            </CustomText>
            <CustomText numberOfLines={2}>
              {t.stockChangeText} {parseFloat(product?.stock).toFixed(2)} .
            </CustomText>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="border border-grey-300 rounded-xl items-center justify-center mt-2 active:opacity-50 h-12 w-full"
            >
              <CustomText classes="font-nsemibold text-base text-dark">
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
          <View className="bg-grey-100 border border-grey-300 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
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
              <CustomText classes="font-nsemibold text-base text-dark">
                OK
              </CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};
