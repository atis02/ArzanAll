import { CustomText } from "../../utils/CustomText";
import { apiURL } from "../../utils/utils";
import { useUnregCustomerStore } from "../../utils/useUnregCustomerStore";
import { useLanguageStore } from "../../utils/useLanguageStore";
import { Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";

const waitListIncrement = async ({ barcode }) => {
  try {
    await fetch(`${apiURL}/actions/waitlist/inc/${barcode}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const waitListDecrement = async ({ barcode }) => {
  try {
    await fetch(`${apiURL}/actions/waitlist/dec/${barcode}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const AddToWaitlist = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const { waitlist, addToWaitlist, removeFromWaitlist } =
    useUnregCustomerStore();
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  const isItemInWaitList = waitlist.some(
    (item) => item?.barcode === product?.barcode
  );

  const handlePress = async () => {
    setLoading(true);

    try {
      if (isItemInWaitList) {
        await waitListDecrement({ barcode: product?.barcode });
        removeFromWaitlist(product?.barcode);
      } else {
        await waitListIncrement({ barcode: product?.barcode });
        addToWaitlist(product);
      }
    } catch (error) {
      console.error("Error handling press:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-primary rounded-xl flex-row items-center justify-center active:bg-primary-600 m-1 mt-2 min-h-[36px]"
    >
      <CustomText classes="text-xs text-white font-nbold" numberOfLines={2}>
        {isItemInWaitList ? t.removeFromWaitlist : t.addToWaitlist}
      </CustomText>
      {loading && (
        <ActivityIndicator size="small" color="#ffffff" className="ml-2" />
      )}
    </Pressable>
  );
};
