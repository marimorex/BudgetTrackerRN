import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bank } from "../../src/domain";
import { makeUseCases } from "../../src/usecases";
import { BankId } from "../../src/domain/types";
import { Link, useFocusEffect } from "expo-router";

export default function BanksScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [banks, setBanks] = useState<Bank[]>([]);

  function reload() {
    const bankList = uc.listBanks.execute();
    setBanks(bankList);
  }

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  function handleDelete(id: BankId) {
    try {
      uc.deleteBank.execute(id);
      reload();
    } catch (e: any) {
      // This will fail if accounts are using this bank.
      // In a real app, you'd show a user-friendly error.
      alert(e.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Banks</Text>
        <Link href="/banks/form" asChild>
          <Pressable style={{ borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Create Bank</Text>
          </Pressable>
        </Link>
      </View>

      {/* List */}
      <FlatList
        data={banks}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ gap: 10, paddingTop: 8 }}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 }}>
            <Text style={{ fontWeight: "700" }}>{item.name}</Text>
            {item.description ? <Text>{item.description}</Text> : null}
            <Text style={{ opacity: 0.6, fontSize: 12 }}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Link href={{ pathname: "/banks/form", params: { id: item.id } }} asChild>
                <Pressable>
                  <Text style={{ color: "blue" }}>Edit</Text>
                </Pressable>
              </Link>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={{ color: "crimson" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No banks found.</Text>}
      />
    </SafeAreaView>
  );
}
