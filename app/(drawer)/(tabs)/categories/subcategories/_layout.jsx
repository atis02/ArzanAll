import { Stack } from "expo-router";

export default () => {
  return (
    <Stack>
      <Stack.Screen name="segments" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};
