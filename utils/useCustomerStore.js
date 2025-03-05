import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCustomerStore = create(
  persist(
    (set, get) => ({
      useCustomerData: {},
      updateCustomerData: (data) => set((state) => ({ useCustomerData: data })),
      addToShoppingCart: (item, quantity) => {
        const shoppingCart = get().shoppingCart;
        const existingItemIndex = shoppingCart.findIndex(
          (cartItem) => cartItem.barcode === item.barcode
        );
        if (existingItemIndex !== -1) {
          return;
        }

        const newCartItem = {
          quantity: quantity,
          barcode: item.barcode,
        };

        set({ shoppingCart: [...shoppingCart, newCartItem] });
      },
      updateShoppingCartQuantity: (itemBarcode, quantity) => {
        const shoppingCart = get().shoppingCart;
        const updatedCart = shoppingCart
          .map((cartItem) =>
            cartItem.barcode === itemBarcode
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0);
        set({ shoppingCart: updatedCart });
      },
      setShoppingCartQuantity: (itemBarcode, quantity) => {
        const shoppingCart = get().shoppingCart;
        const updatedCart = shoppingCart
          .map((cartItem) =>
            cartItem.barcode === itemBarcode
              ? { ...cartItem, quantity }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0);
        set({ shoppingCart: updatedCart });
      },
      removeFromShoppingCart: (itemBarcode) =>
        set((state) => ({
          shoppingCart: state.shoppingCart.filter(
            (item) => item.barcode !== itemBarcode
          ),
        })),
      clearShoppingCart: () => set({ shoppingCart: [] }),
    }),
    {
      name: "signed-customer",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
