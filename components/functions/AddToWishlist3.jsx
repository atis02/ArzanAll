import { icons } from "../../utils/icons";
import { useUnregCustomerStore } from "../../utils/useUnregCustomerStore";
import { Image } from "expo-image";
import { Pressable } from "react-native";

export const AddToWishlistThree = ({ product }) => {
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
      className="bg-white dark:bg-dark-accent rounded-xl items-center justify-center absolute right-1 top-1 active:opacity-70 h-7 w-7"
    >
      {isItemInWishlist ? (
        <Image
          source={icons.heartFill}
          contentFit="contain"
          className="h-5 w-5"
          transition={25}
          tintColor="#ff5959"
        />
      ) : (
        <Image
          source={icons.heart}
          contentFit="contain"
          className="h-5 w-5"
          transition={25}
          tintColor="#ff9700"
        />
      )}
    </Pressable>
  );
};
