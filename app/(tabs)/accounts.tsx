import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account, Bank, CurrencyType } from "../../src/domain";
import { makeUseCases } from "../../src/usecases";
import { AccountId, BankId } from "../../src/domain/types";
import { Link, useFocusEffect } from "expo-router";
import { CompactSelect } from "../../components/CompactSelect";

export default function AccountsScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filterBankId, setFilterBankId] = useState<BankId | "all">("all");
  const [filterCurrency, setFilterCurrency] = useState<CurrencyType | "all">("all");

  const currencyTypes: CurrencyType[] = ["EUR", "USD"];

  function reload() {
    const bankFilter = filterBankId === "all" ? {} : { bankId: filterBankId };
    const currencyFilter = filterCurrency === "all" ? {} : { currency: filterCurrency };
    const accountList = uc.listAccounts.execute({ ...bankFilter, ...currencyFilter });
    setAccounts(accountList);
    
    // Only load banks once
    if (banks.length === 0) {
      const bankList = uc.listBanks.execute();
      setBanks(bankList);
    }
  }

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [filterBankId, filterCurrency]) // Rerun if filters change
  );

  function handleDelete(id: AccountId) {
    uc.deleteAccount.execute(id);
    reload();
  }

  const bankOptions = [
    { label: "All Banks", value: "all" },
    ...banks.map((b) => ({ label: b.name, value: b.id })),
  ];

  const currencyOptions = [
    { label: "All Currencies", value: "all" },
    ...currencyTypes.map((c) => ({ label: c, value: c })),
  ];

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Accounts</Text>
        <Link href="/accounts/form" asChild>
          <Pressable style={{ borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Create Account</Text>
          </Pressable>
        </Link>
      </View>

      {/* Filters */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <CompactSelect
            value={filterBankId}
            onChange={(v) => setFilterBankId(v as BankId | "all")}
            options={bankOptions}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CompactSelect
            value={filterCurrency}
            onChange={(v) => setFilterCurrency(v as CurrencyType | "all")}
            options={currencyOptions}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={accounts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ gap: 10, paddingTop: 8 }}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 }}>
            <Text style={{ fontWeight: "700" }}>{item.name}</Text>
            <Text>{item.type} - {item.currency}</Text>
            <Text>Balance: {(item.balanceCents / 100).toFixed(2)}</Text>
            {item.bankId && <Text>Bank: {banks.find(b => b.id === item.bankId)?.name}</Text>}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Link href={{ pathname: "/accounts/form", params: { id: item.id } }} asChild>
                <Pressable><Text style={{ color: "blue" }}>Edit</Text></Pressable>
              </Link>
              <Pressable onPress={() => handleDelete(item.id)}><Text style={{ color: "crimson" }}>Delete</Text></Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.7, textAlign: 'center', marginTop: 20 }}>No accounts found.</Text>}
      />
    </SafeAreaView>
  );
}
