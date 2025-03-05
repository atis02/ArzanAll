import FormField from "../../../../components/nav/FormField";
import { icons } from "../../../../utils/icons";
import { apiURL, LoadingLarge } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useLanguageStore } from "../../../../utils/useLanguageStore";
import { useCustomerStore } from "../../../../utils/useCustomerStore";
import { useState, useCallback } from "react";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";

const FieldContainer = ({ title, content }) => {
  return (
    <View className="rounded-xl flex-row items-center justify-between px-2 min-h-[40px]">
      <CustomText classes="text-dark-accent mr-4">{title}:</CustomText>
      <CustomText
        classes="text-dark-accent text-right font-nsemibold max-w-[200px]"
        numberOfLines={30}
      >
        {content}
      </CustomText>
    </View>
  );
};

const mapResponseToForm = (data) => {
  return {
    phoneNumber: data.phoneNumber ? data.phoneNumber.slice(-8) : "",
    email: data.email || "",
    username: data.username || "",
    streetOne: data?.AddressOne?.street || "",
    houseOne: data?.AddressOne?.house || "",
    entranceOne: data?.AddressOne?.entrance || "",
    roofOne: data?.AddressOne?.roof || "",
    roomOne: data?.AddressOne?.room || "",
    streetTwo: data?.AddressTwo?.street || "",
    houseTwo: data?.AddressTwo?.house || "",
    entranceTwo: data?.AddressTwo?.entrance || "",
    roofTwo: data?.AddressTwo?.roof || "",
    roomTwo: data?.AddressTwo?.room || "",
    streetThree: data?.AddressThree?.street || "",
    houseThree: data?.AddressThree?.house || "",
    entranceThree: data?.AddressThree?.entrance || "",
    roofThree: data?.AddressThree?.roof || "",
    roomThree: data?.AddressThree?.room || "",
  };
};

export default function EditProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [clientData, setClientData] = useState({});
  const [accountDeleteModal, setAccountDeleteModal] = useState(false);
  const [form, setForm] = useState({
    phoneNumber: "",
    email: "",
    username: "",
    password: "",
    streetOne: "",
    houseOne: "",
    entranceOne: "",
    roofOne: "",
    roomOne: "",
    streetTwo: "",
    houseTwo: "",
    entranceTwo: "",
    roofTwo: "",
    roomTwo: "",
    streetThree: "",
    houseThree: "",
    entranceThree: "",
    roofThree: "",
    roomThree: "",
  });
  const { useCustomerData, updateCustomerData } = useCustomerStore();
  const { getTranslations } = useLanguageStore();
  const { colorScheme } = useColorScheme();
  const t = getTranslations();

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${apiURL}/customer/fetch/${useCustomerData?.id}`
      );
      const data = await response.json();
      setClientData(data);
      setForm(mapResponseToForm(data));
      setIsEditing(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert(t.error, t.errorFetchingData);
    } finally {
      setIsLoading(false);
    }
  }, [useCustomerData?.id, t]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const {
    phoneNumber,
    pointsEarned,
    username,
    password,
    AddressOne,
    AddressTwo,
    AddressThree,
  } = clientData || {};

  const handleUpdate = async () => {
    if (form.phoneNumber && form.phoneNumber.length < 8) {
      Alert.alert(t.error, t.phoneNumberRequired);
      return;
    }

    if (form.phoneNumber.length > 8) {
      Alert.alert(t.error, t.correctPhoneNumber);
      return;
    }

    const updateData = {
      phoneNumber: form.phoneNumber ? `+993${form.phoneNumber}` : "",
      email: form.email,
      username: form.username,
      streetOne: form.streetOne,
      houseOne: form.houseOne,
      entranceOne: form.entranceOne,
      roofOne: form.roofOne,
      roomOne: form.roomOne,
      streetTwo: form.streetTwo,
      houseTwo: form.houseTwo,
      entranceTwo: form.entranceTwo,
      roofTwo: form.roofTwo,
      roomTwo: form.roomTwo,
      streetThree: form.streetThree,
      houseThree: form.houseThree,
      entranceThree: form.entranceThree,
      roofThree: form.roofThree,
      roomThree: form.roomThree,
    };

    try {
      setIsUpdating(true);

      const response = await fetch(
        `${apiURL}/customer/update/${useCustomerData?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.status === 400) {
        const res = await response.json();
        Alert.alert(t.error, res.error);
        return;
      }

      if (response.ok) {
        const res = await response.json();
        updateCustomerData(res?.customer);
        Alert.alert(t.success, t.profileUpdated);
        fetchData();
        setIsEditing(false);
      } else {
        const res = await response.json();
        Alert.alert(t.error, res.error);
      }
    } catch (err) {
      Alert.alert(t.error, err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch(
        `${apiURL}/customer/delete/${useCustomerData?.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 400) {
        const res = await response.json();
        Alert.alert(t.error, res.error);
        return;
      }

      if (response.ok) {
        setAccountDeleteModal(false);
        Alert.alert(t.success, t.profileDeleted);
        updateCustomerData(null);
        router.navigate("/");
      } else {
        const res = await response.json();
        Alert.alert(t.error, res.error);
      }
    } catch (err) {
      Alert.alert(t.error, err.message);
    }
  };

  const toggleEdit = () => {
    setIsEditing((current) => !current);
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View className="bg-white dark:bg-dark-primary pt-2 px-4 h-full flex-1">
      <View className="flex-row items-center mb-2">
        {isEditing ? (
          <>
            <Pressable
              onPress={handleUpdate}
              className="bg-primary rounded-full flex flex-row justify-center items-center active:bg-primary-600 px-4 h-11 w-fit"
            >
              <CustomText classes="text-white text-center font-nbold">
                {t.save}
              </CustomText>
              {isUpdating && (
                <ActivityIndicator
                  className="ml-2"
                  size="small"
                  color="#ffffff"
                />
              )}
            </Pressable>
            <Pressable
              onPress={toggleEdit}
              className="bg-primary rounded-full flex flex-row justify-center items-center active:bg-primary-600 ml-auto h-10 w-10"
            >
              <Image
                source={icons.cross}
                contentFit="contain"
                className="h-4 w-4"
                tintColor="#ffffff"
              />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => router.back()}
              className="bg-grey-100 dark:bg-dark-accent rounded-full items-center justify-center active:bg-grey-200 dark:active:bg-dark-accent/50 mr-2 h-10 w-10"
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
                classes="font-nbold text-primary text-base"
                numberOfLines={2}
              >
                {t.profile}
              </CustomText>
            </View>
            <Pressable
              onPress={toggleEdit}
              className="bg-primary rounded-full flex flex-row justify-center items-center active:bg-primary-600 ml-auto h-10 w-10"
            >
              <Image
                source={icons.edit}
                contentFit="contain"
                className="h-4 w-4"
                tintColor="#ffffff"
              />
            </Pressable>
            <Pressable
              onPress={() => setAccountDeleteModal(true)}
              className="bg-red rounded-full flex flex-row justify-center items-center active:opacity-70 ml-2 h-10 w-10"
            >
              <Image
                source={icons.trashBin}
                contentFit="contain"
                className="h-4 w-4"
                tintColor="#ffffff"
              />
            </Pressable>
          </>
        )}
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={fetchData} />
          }
        >
          <View>
            {isLoading ? (
              <View className="dark:bg-dark-primary items-center justify-center h-full">
                <LoadingLarge />
              </View>
            ) : (
              <>
                {isEditing ? (
                  <>
                    <FormField
                      containerClasses="mb-1 w-full"
                      placeholder={t.phoneNumber}
                      value={form.phoneNumber}
                      handleChangeText={(value) =>
                        handleInputChange("phoneNumber", value)
                      }
                      placeholderTextColor="#a4a4a4"
                      isPhoneNumberField={true}
                      maxLength={8}
                    />
                    <FormField
                      containerClasses="mb-2"
                      placeholder={t.username}
                      value={form.username}
                      handleChangeText={(value) =>
                        handleInputChange("username", value)
                      }
                      placeholderTextColor="#a4a4a4"
                    />
                    <View className="bg-green-400 rounded-xl mb-2">
                      <View className="border-b border-green-500 rounded-t-xl flex-row items-center justify-between px-2 h-10">
                        <CustomText classes="text-dark-primary mr-4 font-nbold">
                          {t.addressOne}
                        </CustomText>
                      </View>
                      <FormField
                        containerClasses="mx-2"
                        value={form.streetOne}
                        handleChangeText={(value) =>
                          handleInputChange("streetOne", value)
                        }
                        placeholder={t.addressStreet}
                        placeholderTextColor="#a4a4a4"
                        isMultiline={true}
                        numberOfLines={3}
                        verticalAlign="top"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.houseOne}
                        handleChangeText={(value) =>
                          handleInputChange("houseOne", value)
                        }
                        placeholder={t.addressHouse}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.entranceOne}
                        handleChangeText={(value) =>
                          handleInputChange("entranceOne", value)
                        }
                        placeholder={t.addressEntrance}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.roofOne}
                        handleChangeText={(value) =>
                          handleInputChange("roofOne", value)
                        }
                        placeholder={t.addressRoof}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2 mb-2"
                        value={form.roomOne}
                        handleChangeText={(value) =>
                          handleInputChange("roomOne", value)
                        }
                        placeholder={t.addressRoom}
                        placeholderTextColor="#a4a4a4"
                      />
                    </View>
                    <View className="bg-primary-400 rounded-xl mb-2">
                      <View className="border-b border-primary-500 rounded-t-xl flex-row items-center justify-between px-2 h-10">
                        <CustomText classes="text-dark-primary mr-4 font-nbold">
                          {t.addressTwo}
                        </CustomText>
                      </View>
                      <FormField
                        containerClasses="mx-2"
                        value={form.streetTwo}
                        handleChangeText={(value) =>
                          handleInputChange("streetTwo", value)
                        }
                        placeholder={t.addressStreet}
                        placeholderTextColor="#a4a4a4"
                        isMultiline={true}
                        numberOfLines={3}
                        verticalAlign="top"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.houseTwo}
                        handleChangeText={(value) =>
                          handleInputChange("houseTwo", value)
                        }
                        placeholder={t.addressHouse}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.entranceTwo}
                        handleChangeText={(value) =>
                          handleInputChange("entranceTwo", value)
                        }
                        placeholder={t.addressEntrance}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.roofTwo}
                        handleChangeText={(value) =>
                          handleInputChange("roofTwo", value)
                        }
                        placeholder={t.addressRoof}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2 mb-2"
                        value={form.roomTwo}
                        handleChangeText={(value) =>
                          handleInputChange("roomTwo", value)
                        }
                        placeholder={t.addressRoom}
                        placeholderTextColor="#a4a4a4"
                      />
                    </View>
                    <View className="bg-sky-400 rounded-xl mb-2">
                      <View className="border-b border-sky-500 rounded-t-xl flex-row items-center justify-between px-2 h-10">
                        <CustomText classes="text-dark-primary mr-4 font-nbold">
                          {t.addressThree}
                        </CustomText>
                      </View>
                      <FormField
                        containerClasses="mx-2"
                        value={form.streetThree}
                        handleChangeText={(value) =>
                          handleInputChange("streetThree", value)
                        }
                        placeholder={t.addressStreet}
                        placeholderTextColor="#a4a4a4"
                        isMultiline={true}
                        numberOfLines={3}
                        verticalAlign="top"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.houseThree}
                        handleChangeText={(value) =>
                          handleInputChange("houseThree", value)
                        }
                        placeholder={t.addressHouse}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.entranceThree}
                        handleChangeText={(value) =>
                          handleInputChange("entranceThree", value)
                        }
                        placeholder={t.addressEntrance}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2"
                        value={form.roofThree}
                        handleChangeText={(value) =>
                          handleInputChange("roofThree", value)
                        }
                        placeholder={t.addressRoof}
                        placeholderTextColor="#a4a4a4"
                      />
                      <FormField
                        containerClasses="mx-2 mb-2"
                        value={form.roomThree}
                        handleChangeText={(value) =>
                          handleInputChange("roomThree", value)
                        }
                        placeholder={t.addressRoom}
                        placeholderTextColor="#a4a4a4"
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View className="bg-grey-100 dark:bg-dark-accent rounded-xl flex-row items-center justify-between mb-2 px-2 h-11">
                      <CustomText classes="dark:text-grey-200">
                        {t.phoneNumber}:
                      </CustomText>
                      <CustomText classes="font-nsemibold dark:text-white">
                        {phoneNumber || t.no}
                      </CustomText>
                    </View>
                    <View className="bg-grey-100 dark:bg-dark-accent rounded-xl flex-row items-center justify-between mb-2 px-2 h-11">
                      <CustomText classes="dark:text-grey-200">
                        {t.username}:
                      </CustomText>
                      <CustomText classes="font-nsemibold dark:text-white">
                        {username || t.no}
                      </CustomText>
                    </View>
                    <View className="bg-grey-100 dark:bg-dark-accent rounded-xl flex-row items-center justify-between mb-2 px-2 h-11">
                      <CustomText classes="dark:text-grey-200">
                        {t.pointsEarned}:
                      </CustomText>
                      <CustomText classes="font-nsemibold dark:text-white">
                        {pointsEarned || 0}
                      </CustomText>
                    </View>
                    <View className="bg-green-400 rounded-xl mb-2">
                      <View className="border-b border-green-500 rounded-t-xl flex-row items-center justify-between px-2 h-10">
                        <CustomText classes="text-dark-accent mr-4 font-nbold">
                          {t.addressOne}
                        </CustomText>
                      </View>
                      <FieldContainer
                        title={t.addressStreet}
                        content={AddressOne?.street || t.no}
                      />
                      <FieldContainer
                        title={t.addressHouse}
                        content={AddressOne?.house || t.no}
                      />
                      <FieldContainer
                        title={t.addressEntrance}
                        content={AddressOne?.entrance || t.no}
                      />
                      <FieldContainer
                        title={t.addressRoof}
                        content={AddressOne?.roof || t.no}
                      />
                      <FieldContainer
                        title={t.addressRoom}
                        content={AddressOne?.room || t.no}
                      />
                    </View>
                    <View className="bg-primary-400 rounded-xl mb-2">
                      <View className="border-b border-primary-500 rounded-t-xl flex-row items-center justify-between px-2 h-10">
                        <CustomText classes="text-dark-accent mr-4 font-nbold">
                          {t.addressTwo}
                        </CustomText>
                      </View>
                      <FieldContainer
                        title={t.addressStreet}
                        content={AddressTwo?.street || t.no}
                      />
                      <FieldContainer
                        title={t.addressHouse}
                        content={AddressTwo?.house || t.no}
                      />
                      <FieldContainer
                        title={t.addressEntrance}
                        content={AddressTwo?.entrance || t.no}
                      />
                      <FieldContainer
                        title={t.addressRoof}
                        content={AddressTwo?.roof || t.no}
                      />
                      <FieldContainer
                        title={t.addressRoom}
                        content={AddressTwo?.room || t.no}
                      />
                    </View>
                    <View className="bg-sky-400 rounded-xl mb-2">
                      <View className="border-b border-sky-500 rounded-t-xl flex-row items-center justify-between px-2 h-10">
                        <CustomText classes="text-dark-accent mr-4 font-nbold">
                          {t.addressThree}
                        </CustomText>
                      </View>
                      <FieldContainer
                        title={t.addressStreet}
                        content={AddressThree?.street || t.no}
                      />
                      <FieldContainer
                        title={t.addressHouse}
                        content={AddressThree?.house || t.no}
                      />
                      <FieldContainer
                        title={t.addressEntrance}
                        content={AddressThree?.entrance || t.no}
                      />
                      <FieldContainer
                        title={t.addressRoof}
                        content={AddressThree?.roof || t.no}
                      />
                      <FieldContainer
                        title={t.addressRoom}
                        content={AddressThree?.room || t.no}
                      />
                    </View>
                  </>
                )}
              </>
            )}
            <Modal
              animationType="fade"
              transparent={true}
              visible={accountDeleteModal}
            >
              <View className="flex-1 items-center justify-center">
                <View className="bg-grey-50 dark:bg-dark-accent border border-grey-400 dark:border-transparent rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
                  <CustomText
                    numberOfLines={2}
                    classes="text-center text-base font-nbold text-dark-accent dark:text-grey-200 mb-2"
                  >
                    {t.confirmDeleteText}
                  </CustomText>
                  <CustomText
                    numberOfLines={10}
                    classes="text-center text-base text-red mb-2"
                  >
                    {t.noComeback}
                  </CustomText>
                  <View className="rounded-xl flex-row justify-between items-center w-full">
                    <Pressable
                      onPress={() => {
                        setAccountDeleteModal(false);
                      }}
                      className="bg-primary rounded-xl items-center justify-center active:bg-primary-600 h-11 w-[40%]"
                    >
                      <CustomText classes="font-nsemibold text-base text-white">
                        {t.no}
                      </CustomText>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        deleteAccount();
                      }}
                      className="bg-primary rounded-xl items-center justify-center active:bg-primary-600 h-11 w-[40%]"
                    >
                      <CustomText classes="font-nsemibold text-base text-white">
                        {t.yes}
                      </CustomText>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
