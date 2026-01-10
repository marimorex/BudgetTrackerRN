import { Stack } from "expo-router";
import React from "react";

export default function BanksLayout() {
  return (
    <Stack>
      <Stack.Screen name="form" options={{ title: "Bank Form", presentation: "modal" }} />
    </Stack>
  );
}
