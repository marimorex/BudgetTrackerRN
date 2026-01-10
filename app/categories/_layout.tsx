import { Stack } from "expo-router";
import React from "react";

export default function CategoriesLayout() {
  return (
    <Stack>
      <Stack.Screen name="form" options={{ title: "Category Form", presentation: "modal" }} />
    </Stack>
  );
}
