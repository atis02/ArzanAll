import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUnregCustomerStore = create(
  persist(
    (set, get) => ({
      unRegCustomer: {},
      updateUnRegCustomer: (data) => set((state) => ({ unRegCustomer: data })),
      wishlist: [],
      addToWishlist: (item) => {
        const wishlist = get().wishlist;
        const existingItemIndex = wishlist.findIndex(
          (wishlistItem) => wishlistItem.barcode === item.barcode
        );
        if (existingItemIndex !== -1) {
          wishlist.splice(existingItemIndex, 1);
        }
        set({ wishlist: [...wishlist, item] });
      },
      removeFromWishlist: (itemBarcode) =>
        set((state) => ({
          wishlist: state.wishlist.filter(
            (item) => item.barcode !== itemBarcode
          ),
        })),
      waitlist: [],
      addToWaitlist: (item) => {
        const waitlist = get().waitlist;
        const existingItemIndex = waitlist.findIndex(
          (waitlistItem) => waitlistItem.barcode === item.barcode
        );
        if (existingItemIndex !== -1) {
          waitlist.splice(existingItemIndex, 1);
        }
        set({ waitlist: [...waitlist, item] });
      },
      removeFromWaitlist: (itemBarcode) =>
        set((state) => ({
          waitlist: state.waitlist.filter(
            (item) => item.barcode !== itemBarcode
          ),
        })),
      cleanWaitList: () => set({ waitlist: [] }),
      shoppingCart: [],
      addItemsToShoppingCart: (items) => {
        const shoppingCart = get().shoppingCart;
        const updatedCart = [...shoppingCart];

        items.forEach(({ barcode, quantity }) => {
          const existingItemIndex = updatedCart.findIndex(
            (cartItem) => cartItem.barcode === barcode
          );

          if (existingItemIndex === -1) {
            updatedCart.push({ barcode: barcode, quantity });
          }
        });

        set({ shoppingCart: updatedCart });
      },
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
      clearwaitlist: () => set({ waitlist: [] }),
      clearShoppingCart: () => set({ shoppingCart: [] }),
    }),
    {
      name: "local-customer",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
