import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account, Category, Transaction } from "../../src/domain";
import { TransactionId } from "../../src/domain/types";
import { makeUseCases } from "../../src/usecases";
import { CompactSelect } from "../../components/CompactSelect";

function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const currency = "€"; // Hardcoded for now
  return `${sign}${(abs / 100).toFixed(2)}${currency}`;
}

type SectionData = {
  title: string;
  data: Transaction[];
};

// Returns a string like "2023-01" for a given date
function getYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

export default function TransactionsScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [sections, setSections] = useState<SectionData[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthOptions, setMonthOptions] = useState<{label: string, value: string}[]>([]);

  // Default to the current month, e.g., "2023-01"
  const [filterMonth, setFilterMonth] = useState<string>(getYearMonth(new Date()));

  function reload() {
    const txs = uc.listTransactions.execute();
    const accs = uc.listAccounts.execute();
    const cats = uc.listCategories.execute();
    setAccounts(accs);
    setCategories(cats);

    // Generate month filter options from all transactions
    const allMonths = new Set(txs.map(tx => getYearMonth(new Date(tx.date))));
    const currentMonth = getYearMonth(new Date());
    allMonths.add(currentMonth); // Ensure current month is always an option

    const sortedMonths = Array.from(allMonths).sort().reverse();
    setMonthOptions([
      { label: "All Months", value: "all" },
      ...sortedMonths.map(m => ({
        label: new Date(`${m}-02`).toLocaleString("default", { month: "long", year: "numeric" }), // Use day 2 to avoid timezone issues
        value: m,
      }))
    ]);
    
    // Filter transactions by selected month
    const filteredTxs = filterMonth === "all"
      ? txs
      : txs.filter(tx => getYearMonth(new Date(tx.date)) === filterMonth);

    // Group filtered transactions by month for SectionList
    const grouped = filteredTxs.reduce((acc, tx) => {
      const month = new Date(tx.date).toLocaleString("default", { month: "long", year: "numeric" });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);

    const sortedSections = Object.entries(grouped)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => new Date(b.data[0].date).getTime() - new Date(a.data[0].date).getTime());
      
    setSections(sortedSections);
  }

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [filterMonth]) // Rerun if filter changes
  );

  function handleDelete(id: TransactionId) {
    uc.deleteTransaction.execute(id);
    reload();
  }
  
  function getAccountName(id: string) {
    return accounts.find(a => a.id === id)?.name ?? "Unknown Account";
  }

  function getCategoryName(id: string | null) {
    if (!id) return "Uncategorized";
    return categories.find(c => c.id === id)?.name ?? "Unknown Category";
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Transactions</Text>
        <Link href="/transactions/form" asChild>
          <Pressable style={{ borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Add Transaction</Text>
          </Pressable>
        </Link>
      </View>

      <CompactSelect
        label="Filter by month"
        value={filterMonth}
        onChange={(v) => setFilterMonth(v as string)}
        options={monthOptions}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={{ fontSize: 18, fontWeight: "bold", paddingVertical: 8, backgroundColor: '#f0f0f0', marginTop: 12 }}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 14, padding: 12, gap: 4, marginVertical: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: "700", flex: 1 }} numberOfLines={1}>{item.description || "No description"}</Text>
              <Text style={{ fontWeight: "bold", color: item.amountCents > 0 ? "green" : "black" }}>{formatCents(item.amountCents)}</Text>
            </View>
            <Text style={{ opacity: 0.8 }}>
              {getAccountName(item.accountId)}
            </Text>
            <Text style={{ opacity: 0.6, fontSize: 12 }}>
              {getCategoryName(item.categoryId)} - {new Date(item.date).toLocaleDateString()}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Link href={{ pathname: "/transactions/form", params: { id: item.id } }} asChild>
                <Pressable><Text style={{ color: "blue" }}>Edit</Text></Pressable>
              </Link>
              <Pressable onPress={() => handleDelete(item.id)}><Text style={{ color: "crimson" }}>Delete</Text></Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.7, textAlign: 'center', marginTop: 20 }}>No transactions found for this period.</Text>}
      />
    </SafeAreaView>
  );
}