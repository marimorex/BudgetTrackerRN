import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { Account, Category, Transaction } from "../../src/domain";
import { makeUseCases } from "../../src/usecases";

function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${(abs / 100).toFixed(2)}`;
}

export default function TransactionsScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [desc, setDesc] = useState("");
  const [amountText, setAmountText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reload() {
    const accs = uc.listAccounts.execute();
    setAccounts(accs);

    const cats = uc.listCategories.execute();
    setCategories(cats);

    const defaultAccountId = selectedAccountId ?? accs[0]?.id ?? null;
    setSelectedAccountId(defaultAccountId);

    const list = uc.listTransactions.execute({ accountId: defaultAccountId ?? undefined });
    setTxs(list);

    // Set a default category if none selected yet
    if (!selectedCategoryId && cats[0]) setSelectedCategoryId(cats[0].id);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When account changes, reload tx list
  useEffect(() => {
    if (!selectedAccountId) return;
    const list = uc.listTransactions.execute({ accountId: selectedAccountId });
    setTxs(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) ?? null;
  const selectedCategory = categories.find(c => c.id === selectedCategoryId) ?? null;

  function addTransaction() {
    try {
      setError(null);

      if (!selectedAccountId) throw new Error("No account selected");
      if (!selectedCategoryId) throw new Error("No category selected");

      const amt = Number(amountText.replace(",", "."));
      if (!Number.isFinite(amt)) throw new Error("Amount must be a number");

      const amountCents = Math.round(amt * 100);

      uc.createTransaction.execute({
        accountId: selectedAccountId,
        categoryId: selectedCategoryId,
        amountCents,
        description: desc.trim() || null,
      });

      setDesc("");
      setAmountText("");
      reload();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Transactions</Text>

      {/* Account selector */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600" }}>Account</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {accounts.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => setSelectedAccountId(a.id)}
              style={{
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 10,
                opacity: selectedAccountId === a.id ? 1 : 0.6,
              }}
            >
              <Text>{a.name} ({a.currency})</Text>
            </Pressable>
          ))}
        </View>
        {selectedAccount ? (
          <Text style={{ opacity: 0.7 }}>
            Balance: {formatCents(selectedAccount.balanceCents)} {selectedAccount.currency}
          </Text>
        ) : (
          <Text style={{ color: "crimson" }}>No accounts found (seed missing)</Text>
        )}
      </View>

      {/* Category selector */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600" }}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setSelectedCategoryId(c.id)}
              style={{
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 10,
                opacity: selectedCategoryId === c.id ? 1 : 0.6,
              }}
            >
              <Text>
                {c.name} ({c.type})
              </Text>
            </Pressable>
          ))}
        </View>
        {!selectedCategory ? (
          <Text style={{ color: "crimson" }}>No category selected</Text>
        ) : null}
      </View>

      {/* Form */}
      <View style={{ gap: 8 }}>
        <TextInput
          value={desc}
          onChangeText={setDesc}
          placeholder="Description (e.g. Groceries)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />
        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          placeholder="Amount (e.g. -23.50 or 1200)"
          keyboardType="decimal-pad"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}

        <Pressable
          onPress={addTransaction}
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}
        >
          <Text style={{ fontWeight: "700" }}>Add transaction</Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={txs}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 10, paddingTop: 8 }}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 }}>
            <Text style={{ fontWeight: "700" }}>{item.description || "No description"}</Text>
            <Text>
              {formatCents(item.amountCents)} {selectedAccount?.currency ?? ""}
            </Text>
            <Text style={{ opacity: 0.6, fontSize: 12 }}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No transactions yet.</Text>}
      />
    </SafeAreaView>
  );
}