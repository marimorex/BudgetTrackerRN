import { Stack } from "expo-router";
import React from "react";

export default function TransactionsLayout() {
  return (
    <Stack>
      <Stack.Screen name="form" options={{ title: "Transaction Form", presentation: "modal" }} />
    </Stack>
  );
}
