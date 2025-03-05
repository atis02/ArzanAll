import Toast from "react-native-root-toast";
import { styled } from "nativewind";

const StyledToast = styled(Toast);

const throwToast = (message) => {
  Toast.show(message, {
    duration: 250,
    position: Toast.positions.BOTTOM,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
    containerStyle: {
      backgroundColor: "#ff9700",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 60,
    },
    textStyle: {
      color: "#fff",
      fontSize: 16,
    },
  });
};

const CustomToast = ({ message, options }) => {
  return <StyledToast {...options}>{message}</StyledToast>;
};

export { throwToast, CustomToast };
