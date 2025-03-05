import FormField from "../../../../components/nav/FormField";
import { icons } from "../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useLanguageStore } from "../../../../utils/useLanguageStore";
import { useCustomerStore } from "../../../../utils/useCustomerStore";
import { useUnregCustomerStore } from "../../../../utils/useUnregCustomerStore";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  RefreshControl,
  Platform,
  Linking,
} from "react-native";
import { useColorScheme } from "nativewind";
import OTPTextView from "react-native-otp-textinput";

const registrationOptions = [
  {
    id: 1,
    nameRu: "Стандартный вход",
    nameTm: "Standart ulgama giriş",
    icon: icons.userid,
  },
  {
    id: 2,
    nameRu: "Вход с СМС",
    nameTm: "SMS bilen ulgama girmek",
    icon: icons.zap,
  },
];

export default function SignInScreen() {
  const { updateCustomerData } = useCustomerStore();
  const { updateUnRegCustomer } = useUnregCustomerStore();
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpCheckScreen, setOtpCheckScreen] = useState(false);
  const [registerMethod, setRegisterMethod] = useState(1);
  const [timeOut, setTimeOut] = useState(60);
  const [otpInput, setOtpInput] = useState("");
  const [data, setData] = useState();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [form, setForm] = useState({
    phoneNumber: "",
    anotherPhoneNumber: "+993",
    password: "",
    otp: "",
  });
  const input = useRef(null);
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const { colorScheme } = useColorScheme();
  const isRefreshing = false;

  useEffect(() => {
    let intervalId;

    if (resendDisabled && timeOut > 0) {
      intervalId = setInterval(() => {
        setTimeOut((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeOut === 0) {
      setResendDisabled(false);
    }

    return () => clearInterval(intervalId);
  }, [resendDisabled, timeOut]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
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

  const handleSignInRequest = async () => {
    if (form.anotherPhoneNumber.length < 12) {
      Alert.alert(t.emptyFieldHeader, t.phoneNumberRequired);
      return;
    }

    if (form.password.length < 8) {
      Alert.alert(t.emptyFieldHeader, t.passwordMinLength);
      return;
    }

    setSubmitting(true);

    const signInData = {
      phoneNumber: form.anotherPhoneNumber,
      password: form.password,
    };

    try {
      const response = await fetch(`${apiURL}/customer/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signInData),
      });

      if (response.status === 401) {
        const res = await response.json();
        Alert.alert(t.error, res.message);
        return;
      }

      if (response.ok) {
        const res = await response.json();
        Alert.alert(t.success, t.youAreSignedIn);
        updateCustomerData(res?.customer);
        updateUnRegCustomer(null);
        router.navigate("/profile");
      } else {
        Alert.alert(t.error, t.networkError);
      }
    } catch (err) {
      Alert.alert(t.error, err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
        setResendDisabled(true);
        setTimeOut(60);
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
      const response = await fetch(`${apiURL}/actions/otp/check/signin`, {
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
        Alert.alert(t.success, t.youAreSignedIn);
        updateCustomerData(res?.customer);
        setOtpCheckScreen(false);
        updateUnRegCustomer(null);
        router.navigate("/profile");
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
      className="bg-white dark:bg-dark-primary py-2 px-4"
      keyboardVerticalOffset={0}
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
            <View className="items-center justify-center">
              <Image
                source={icons.logoNoText}
                contentFit="contain"
                className="h-44 w-44"
              />
            </View>
            <View className="bg-grey-50 dark:bg-dark-accent rounded-xl flex-row items-center justify-between mb-2">
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
            {registerMethod === 1 ? (
              <View className="items-center">
                <FormField
                  containerClasses="mb-1 w-full"
                  placeholder={t.phoneNumber}
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
                  containerClasses="mb-2 w-full"
                  placeholder={t.password}
                  value={form.password}
                  handleChangeText={(e) => setForm({ ...form, password: e })}
                  placeholderTextColor="#a4a4a4"
                  isPasswordField={true}
                />
                <Pressable
                  onPress={handleSignInRequest}
                  className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 mb-2 px-4 h-11 w-full"
                  disabled={submitting}
                >
                  <Image
                    source={icons.signIn}
                    contentFit="contain"
                    className="mr-2 h-4 w-4"
                    tintColor="#ffffff"
                  />
                  <CustomText classes="text-white">
                    {t.loginToSystem}
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
                  onPress={() => {
                    const phoneNumber = data?.contactNumberOne;
                    Linking.openURL(`tel:${phoneNumber}`);
                  }}
                  className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 px-4 h-11 w-full"
                >
                  <Image
                    source={icons.phone}
                    contentFit="contain"
                    className="mr-2 h-5 w-5"
                    tintColor="#ffffff"
                  />
                  <CustomText classes="text-white">{t.call}</CustomText>
                </Pressable>
              </View>
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
                          className={`bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-600 px-4 h-11 w-full`}
                          disabled={submitting || resendDisabled}
                        >
                          <CustomText classes="text-white">
                            {resendDisabled
                              ? `${t.getCodeAgain} (${formatTime(timeOut)})`
                              : t.getCodeAgain}
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
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
