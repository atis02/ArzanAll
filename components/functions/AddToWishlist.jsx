import { icons } from "../../utils/icons";
import { useUnregCustomerStore } from "../../utils/useUnregCustomerStore";
import { Image } from "expo-image";
import { Pressable } from "react-native";

export const AddToWishlist = ({ product }) => {
  const { wishlist, addToWishlist, removeFromWishlist } =
    useUnregCustomerStore();

  const isItemInWishlist = wishlist.some(
    (item) => item?.barcode === product?.barcode
  );

  const handlePress = () => {
    if (isItemInWishlist) {
      removeFromWishlist(product?.barcode);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white dark:bg-dark-secondary rounded-xl items-center justify-center h-11 w-11"
    >
      {isItemInWishlist ? (
        <Image
          source={icons.heartFill}
          contentFit="contain"
          className="h-6 w-6"
          transition={25}
          tintColor="#ff5959"
        />
      ) : (
        <Image
          source={icons.heart}
          contentFit="contain"
          className="h-6 w-6"
          transition={25}
          tintColor="#ff5959"
        />
      )}
    </Pressable>
  );
};
