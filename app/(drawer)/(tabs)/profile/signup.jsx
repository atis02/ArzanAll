import FormField from "../../../../components/nav/FormField";
import { icons } from "../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useLanguageStore } from "../../../../utils/useLanguageStore";
import { useCustomerStore } from "../../../../utils/useCustomerStore";
import { useUnregCustomerStore } from "../../../../utils/useUnregCustomerStore";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useColorScheme } from "nativewind";
import OTPTextView from "react-native-otp-textinput";

const registrationOptions = [
  {
    id: 1,
    nameRu: "Стандартная регистрация",
    nameTm: "Standart registrasiýa",
    icon: icons.userid,
  },
  {
    id: 2,
    nameRu: "СМС регистрация",
    nameTm: "SMS registrasiýa",
    icon: icons.zap,
  },
];

export default function SignUpScreen() {
  const { updateCustomerData } = useCustomerStore();
  const { updateUnRegCustomer } = useUnregCustomerStore();
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpCheckScreen, setOtpCheckScreen] = useState(false);
  const [registerMethod, setRegisterMethod] = useState(1);
  const [otpInput, setOtpInput] = useState("");
  const [data, setData] = useState();
  const [form, setForm] = useState({
    phoneNumber: "",
    anotherPhoneNumber: "+993",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    otpCode: "",
  });
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();
  const isRefreshing = false;
  const input = useRef(null);

  const handleSignUpRequest = async () => {
    if (form.anotherPhoneNumber.length === 0) {
      Alert.alert(t.error, t.phoneNumberRequired);
      return;
    }

    if (form.anotherPhoneNumber.length < 12) {
      Alert.alert(t.error, t.correctPhoneNumber);
      return;
    }

    if (!form.username) {
      Alert.alert(t.emptyFieldHeader, t.usernameIsMust);
      return;
    }

    if (form.password.length < 8) {
      Alert.alert(t.emptyFieldHeader, t.passwordMinLength);
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert(t.error, t.passwordMismatch);
      return;
    }

    setSubmitting(true);

    const orderFormData = {
      phoneNumber: form.anotherPhoneNumber,
      email: null,
      username: form.username,
      password: form.password,
    };

    try {
      const response = await fetch(`${apiURL}/customer/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderFormData),
      });

      if (response.status === 409) {
        const data = await response.json();
        Alert.alert(t.error, data.message);
        return;
      }

      if (response.ok) {
        const res = await response.json();
        Alert.alert(t.success, t.youAreSignedUp);
        updateCustomerData(res?.customer);
        updateUnRegCustomer(null);
        router.navigate("/profile");
      } else {
        const res = await response.json();
        Alert.alert(t.error, res.error);
        console.log(res);
      }
    } catch (err) {
      Alert.alert(t.error, err.message);
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchInfo = async () => {
    setIsLoading(false);
    try {
      const response = await fetch(`${apiURL}/settings/get`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInfo();
    }, [])
  );

  const sendOTPRequest = async () => {
    if (form.phoneNumber.length < 8) {
      Alert.alert(t.emptyFieldHeader, t.phoneNumberRequired);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${apiURL}/actions/otp/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: form.phoneNumber,
        }),
      });

      if (response.status === 401) {
        const res = await response.json();
        Alert.alert(t.error, res.message);
        return;
      }

      if (response.ok) {
        setOtpCheckScreen(true);
      } else {
        Alert.alert(t.error, t.networkError);
      }
    } catch (err) {
      Alert.alert(t.error, err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const checkOTPRequest = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(`${apiURL}/actions/otp/check/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: form.phoneNumber,
          code: Number(otpInput),
        }),
      });

      if (response.status === 401) {
        const res = await response.json();
        Alert.alert(t.error, res.message);
        return;
      }

      if (response.ok) {
        const res = await response.json();
        Alert.alert(t.success, t.youAreSignedUp);
        updateCustomerData(res?.customer);
        updateUnRegCustomer(null);
        router.navigate("/profile");
        setOtpCheckScreen(false);
      } else {
        const res = await response.json();
        Alert.alert(t.error, res.message);
      }
    } catch (err) {
      Alert.alert(t.error, err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
      className="bg-white dark:bg-dark-primary pt-2 px-4"
    >
      <View className="flex-row items-center">
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
        <View className="justify-center items-start">
          <CustomText
            classes="font-nbold text-dark-accent dark:text-grey-200 text-base"
            numberOfLines={2}
          >
            {t.back}
          </CustomText>
        </View>
      </View>
      <ScrollView
        style={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchInfo} />
        }
      >
        {isLoading ? (
          <LoadingLarge />
        ) : (
          <>
            <View className="items-center justify-center mb-2">
              <Image
                source={icons.logoNoText}
                contentFit="contain"
                className="h-44 w-44"
              />
              <CustomText
                classes="text-lg text-primary text-center font-nbold max-w-[190px]"
                numberOfLines={2}
              >
                {t.welcome}
              </CustomText>
            </View>
            <View className="bg-grey-50 dark:bg-dark-accent rounded-xl flex-row items-center justify-between mb-4">
              {registrationOptions?.map((item) => (
                <View className="w-1/2" key={item?.id}>
                  <Pressable
                    onPress={() => {
                      setRegisterMethod(item?.id);
                    }}
                    className={`justify-center items-center px-2 min-h-[48px] w-full ${
                      registerMethod === item?.id ? "bg-primary" : ""
                    } ${
                      item.id === 1
                        ? "rounded-l-xl border-r-0"
                        : "rounded-r-xl border-l-0"
                    }`}
                  >
                    <Image
                      source={item.icon}
                      contentFit="contain"
                      className="mb-1 h-5 w-5"
                      tintColor={
                        registerMethod === item?.id
                          ? "#ffffff"
                          : colorScheme === "light"
                          ? "#1b1c1d"
                          : "#dfdfdf"
                      }
                    />
                    <CustomText
                      classes={`font-nsemibold text-center text-xs ${
                        registerMethod === item?.id
                          ? "text-white"
                          : "text-dark-accent dark:text-grey-200"
                      }`}
                      numberOfLines={2}
                    >
                      {language === "tm" ? item?.nameTm : item?.nameRu}
                    </CustomText>
                  </Pressable>
                </View>
              ))}
            </View>
            <View className="items-center">
              {registerMethod === 1 ? (
                <>
                  <FormField
                    title={t.phoneNumber}
                    important={true}
                    containerClasses="mb-2 w-full"
                    value={form.anotherPhoneNumber}
                    handleChangeText={(e) =>
                      setForm({ ...form, anotherPhoneNumber: e })
                    }
                    isAnotherNumber={true}
                    anotherNumberText={t.tmOrRuNumber}
                    placeholderTextColor="#a4a4a4"
                    maxLength={12}
                  />
                  <FormField
                    title={t.username}
                    important={true}
                    containerClasses="mb-2 w-full"
                    placeholder={t.username}
                    value={form.username}
                    handleChangeText={(e) => setForm({ ...form, username: e })}
                    placeholderTextColor="#a4a4a4"
                  />
                  <FormField
                    title={t.createPassword}
                    important={true}
                    containerClasses="mb-2 w-full"
                    placeholder={t.createPassword}
                    value={form.password}
                    handleChangeText={(e) => setForm({ ...form, password: e })}
                    placeholderTextColor="#a4a4a4"
                    isPasswordField={true}
                    minLength={8}
                  />
                  <FormField
                    title={t.passwordConfirm}
                    important={true}
                    containerClasses="mb-2 w-full"
                    placeholder={t.passwordConfirm}
                    value={form.confirmPassword}
                    handleChangeText={(e) =>
                      setForm({ ...form, confirmPassword: e })
                    }
                    placeholderTextColor="#a4a4a4"
                    isPasswordField={true}
                  />
                  <Pressable
                    onPress={handleSignUpRequest}
                    className={`bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 my-2 px-4 h-11 w-full`}
                    disabled={submitting}
                  >
                    <CustomText classes="text-white">{t.register}</CustomText>
                    {submitting && (
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  {data?.otpIsActive ? (
                    <>
                      {otpCheckScreen ? (
                        <View className="w-full">
                          <CustomText classes="text-dark-primary dark:text-grey-200 mb-2">
                            {t.enterCodeFromMessage}
                          </CustomText>
                          <OTPTextView
                            ref={input}
                            handleTextChange={setOtpInput}
                            handleCellTextChange={(e) =>
                              setForm({ ...form, otpCode: e })
                            }
                            inputCount={6}
                            keyboardType="number-pad"
                            className="bg-grey-50 dark:bg-dark-secondary border border-primary text-center text-dark-accent dark:text-white rounded-xl h-11 w-11"
                            containerStyle={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          />
                          <Pressable
                            onPress={checkOTPRequest}
                            className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 my-2 px-4 h-11 w-full"
                            disabled={submitting}
                          >
                            <CustomText classes="text-white">
                              {t.confirm}
                            </CustomText>
                            {submitting && (
                              <ActivityIndicator
                                size="small"
                                color="#ffffff"
                                style={{ marginLeft: 8 }}
                              />
                            )}
                          </Pressable>
                          <Pressable
                            onPress={sendOTPRequest}
                            className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 px-4 h-11 w-full"
                            disabled={submitting}
                          >
                            <CustomText classes="text-white">
                              {t.getCodeAgain}
                            </CustomText>
                          </Pressable>
                        </View>
                      ) : (
                        <>
                          <FormField
                            title={t.phoneNumber}
                            important={true}
                            containerClasses="mb-2 w-full"
                            placeholder={t.phoneNumber}
                            value={form.phoneNumber}
                            handleChangeText={(e) =>
                              setForm({ ...form, phoneNumber: e })
                            }
                            placeholderTextColor="#a4a4a4"
                            isPhoneNumberField={true}
                            maxLength={8}
                          />
                          <Pressable
                            onPress={sendOTPRequest}
                            className={`bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 my-2 px-4 h-11 w-full`}
                            disabled={submitting}
                          >
                            <CustomText classes="text-white">
                              {t.getOTPCode}
                            </CustomText>
                            {submitting && (
                              <ActivityIndicator
                                size="small"
                                color="#ffffff"
                                style={{ marginLeft: 8 }}
                              />
                            )}
                          </Pressable>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <CustomText
                        classes="text-center text-dark-accent dark:text-grey-200"
                        numberOfLines={2}
                      >
                        {t.serviceAintWorking}
                      </CustomText>
                    </>
                  )}
                </>
              )}
            </View>
            <View className="mb-4"></View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
