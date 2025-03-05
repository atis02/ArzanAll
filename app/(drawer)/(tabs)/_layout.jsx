import NavBar from "../../../components/nav/NavBar";
import { icons } from "../../../utils/icons";
import { CustomText } from "../../../utils/CustomText";
import { useLanguageStore } from "../../../utils/useLanguageStore";
import { Tabs, router, usePathname } from "expo-router";
import { View, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useUnregCustomerStore } from "../../../utils/useUnregCustomerStore";

const TabIcon = ({ name, icon, focused }) => {
  return (
    <View className="items-center justify-center h-16 w-16">
      <View
        className={`rounded-lg items-center justify-center h-10 w-10 ${
          focused ? "bg-primary" : ""
        }`}
      >
        <Image
          source={icon}
          resizeMode="contain"
          className="h-6 w-6"
          tintColor={focused ? "#ffffff" : "#a4a4a4"}
        />
      </View>
      <CustomText
        classes={
          focused
            ? "font-nbold text-primary text-[10px]"
            : "text-grey text-[10px]"
        }
      >
        {name}
      </CustomText>
    </View>
  );
};

export default function MainTabLayout() {
  const { shoppingCart } = useUnregCustomerStore();
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();
  const pathname = usePathname();

  return (
    <SafeAreaView className="bg-white h-full">
      <NavBar />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#ff9700",
          tabBarInactiveTintColor: "#a4a4a4",
          tabBarStyle: {
            backgroundColor: colorScheme === "dark" ? "#23272F" : "#ffffff",
            borderTopWidth: 1,
            borderTopColor: colorScheme === "dark" ? "#343a46" : "#f7f7f7",
            height: 72,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: Platform.OS === "ios" ? 32 : 0,
          },
        }}
        initialRouteName="/"
        backBehavior="history"
      >
        <Tabs.Screen
          name="index"
          href="index"
          options={{
            title: "Home Screen",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name={t.homePage} icon={icons.home} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          href="categories"
          options={{
            title: "Categories",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={t.categories}
                icon={icons.menu}
                focused={focused}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              if (pathname === "/categories") {
                return;
              } else {
                router.replace("/categories");
              }
            },
          }}
        />
        <Tabs.Screen
          name="cart"
          href="cart"
          options={{
            title: "ShoppingCart",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center justify-center relative h-16 w-16">
                <View className="bg-primary rounded-xl items-center justify-center absolute top-1 -right-0 h-5 w-5 z-10">
                  <CustomText classes="font-nbold text-white">
                    {shoppingCart?.length}
                  </CustomText>
                </View>
                <View className="rounded-lg items-center justify-center h-10 w-10">
                  <Image
                    source={icons.cart}
                    resizeMode="contain"
                    className="h-6 w-6"
                    tintColor={focused ? "#ff9700" : "#a4a4a4"}
                  />
                </View>
                <CustomText
                  classes={
                    focused
                      ? "font-nbold text-primary text-[10px]"
                      : "text-grey text-[10px]"
                  }
                >
                  {t.shoppingcart}
                </CustomText>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="wishlist"
          href="wishlist"
          options={{
            title: "Wishlist",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name={t.wishlist} icon={icons.heart} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          href="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon name={t.profile} icon={icons.user} focused={focused} />
            ),
          }}
          listeners={{
            tabPress: () => {
              if (pathname === "/profile") {
                return;
              } else {
                router.replace("/profile");
              }
            },
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="usage"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="new"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="sale"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="popular"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="+not-found"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="search/[searchquery]"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="[barcode]"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="reviews"
          options={{
            headerShown: false,
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
