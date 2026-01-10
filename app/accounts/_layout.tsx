import { Stack } from "expo-router";
import React from "react";

export default function AccountsLayout() {
  return (
    <Stack>
      <Stack.Screen name="form" options={{ title: "Account Form", presentation: "modal" }} />
    </Stack>
  );
}
