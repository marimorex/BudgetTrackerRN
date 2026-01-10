import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeUseCases } from "../../src/usecases";
import { BankId } from "../../src/domain/types";

export default function BankFormScreen() {
  const uc = useMemo(() => makeUseCases(), []);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingBankId = id as BankId | undefined;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBankId) {
      const bank = uc.listBanks.execute().find((b) => b.id === editingBankId);
      if (bank) {
        setName(bank.name);
        setDescription(bank.description ?? "");
      }
    }
  }, [editingBankId]);

  function handleAddOrUpdateBank() {
    try {
      setError(null);
      if (!name.trim()) {
        throw new Error("Bank name cannot be empty");
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      if (editingBankId) {
        uc.updateBank.execute({ id: editingBankId, ...payload });
      } else {
        uc.createBank.execute(payload);
      }

      router.back();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        {editingBankId ? "Edit Bank" : "Create Bank"}
      </Text>

      <View style={{ gap: 12 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Bank Name (e.g. My Bank)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, height: 52 }}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, height: 52 }}
        />

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "gray" }}
          >
            <Text style={{ fontWeight: "700", color: "white" }}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleAddOrUpdateBank}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{editingBankId ? "Update Bank" : "Add Bank"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
