import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

type Tx = {
  id: string;
  title: string;
  amount: number; // signed
  createdAt: string;
};

const STORAGE_KEY = "budgettracker.txs.v1";

function assertValidAmount(n: number) {
  if (!Number.isFinite(n)) throw new Error("Amount must be a number");
  if (n === 0) throw new Error("Amount cannot be 0");
}

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [amountText, setAmountText] = useState("");
  const [txs, setTxs] = useState<Tx[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setTxs(JSON.parse(raw));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
    })();
  }, [txs]);

  const total = useMemo(
    () => txs.reduce((acc, t) => acc + t.amount, 0),
    [txs]
  );

  function addTx() {
    try {
      setError(null);

      const amt = Number(amountText.replace(",", "."));
      assertValidAmount(amt);

      const newTx: Tx = {
        id: String(Date.now()),
        title: title.trim() || "Untitled",
        amount: amt,
        createdAt: new Date().toISOString(),
      };

      setTxs((prev) => [newTx, ...prev]);
      setTitle("");
      setAmountText("");
    } catch (e: any) {
      setError(e?.message ?? "Invalid input");
    }
  }

  function removeTx(id: string) {
    setTxs((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        BudgetTracker (POC)
      </Text>

      <Text style={{ fontSize: 16 }}>
        Total: {total.toFixed(2)}
      </Text>

      <View style={{ gap: 8 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title (e.g. Groceries)"
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
          }}
        />

        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          placeholder="Amount (use - for expense)"
          keyboardType="decimal-pad"
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
          }}
        />

        {error && <Text style={{ color: "crimson" }}>{error}</Text>}

        <Pressable
          onPress={addTx}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            Add transaction
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={txs}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 10, paddingTop: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => removeTx(item.id)}
            style={{
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {item.title}
            </Text>
            <Text>
              {item.amount > 0 ? "+" : ""}
              {item.amount.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12, opacity: 0.6 }}>
              Long press to delete
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}