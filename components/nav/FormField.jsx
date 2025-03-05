import { icons } from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { useState } from "react";
import { Image } from "expo-image";
import { View, TextInput, Pressable } from "react-native";
import { useColorScheme } from "nativewind";

const FormField = ({
  important,
  title,
  value,
  handleChangeText,
  containerClasses,
  isPasswordField,
  isPhoneNumberField,
  isNumberField,
  placeholder,
  placeholderTextColor,
  maxLength,
  isMultiline,
  numberOfLines,
  verticalAlign,
  isAnotherNumber,
  anotherNumberText,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colorScheme } = useColorScheme();

  return (
    <View className={`space-y-1 ${containerClasses}`}>
      {title ? (
        <CustomText classes="text-dark-accent dark:text-grey-200">
          {important ? (
            <CustomText classes="text-red font-nbold">* </CustomText>
          ) : (
            ""
          )}
          {title}
        </CustomText>
      ) : (
        <></>
      )}
      <View className="bg-grey-50 dark:bg-dark-secondary border border-grey-200 dark:border-transparent rounded-xl flex flex-row items-center focus:border-primary px-2 min-h-[44px] w-full">
        {isPhoneNumberField === true ? (
          <CustomText classes="text-dark-primary dark:text-grey-200 text-base">
            +993
          </CustomText>
        ) : (
          <></>
        )}
        {isPasswordField === true && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="items-center justify-center h-11"
          >
            <Image
              source={!showPassword ? icons.eye : icons.eyeCrossed}
              className="w-5 h-5"
              contentFit="contain"
              transition={0}
              tintColor={colorScheme === "dark" ? "#e7e5ef" : "#474747"}
            />
          </Pressable>
        )}
        <TextInput
          keyboardType={
            isPhoneNumberField || isNumberField || isAnotherNumber
              ? "phone-pad"
              : "default"
          }
          className={`flex-1 font-nregular text-dark-primary dark:text-white text-base p-1`}
          value={value}
          onChangeText={handleChangeText}
          secureTextEntry={isPasswordField === true && !showPassword}
          placeholder={isAnotherNumber ? anotherNumberText : placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline={isMultiline}
          numberOfLines={numberOfLines}
          textAlignVertical={verticalAlign}
          maxLength={maxLength}
        />
      </View>
    </View>
  );
};

export default FormField;
