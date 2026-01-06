import { CompactSelect } from "@/components/CompactSelect";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account, Bank, Category, Transaction } from "../../src/domain";
import { BankId, TransactionId } from "../../src/domain/types";
import { makeUseCases } from "../../src/usecases";

function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${(abs / 100).toFixed(2)}`;
}

const CASH_BANK_ID = "CASH";

export default function TransactionsScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);

  const [selectedBankId, setSelectedBankId] = useState<BankId | null>(CASH_BANK_ID);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [desc, setDesc] = useState("");
  const [amountText, setAmountText] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<TransactionId | null>(null);

  function reload() {
    const bankList = uc.listBanks.execute();
    setBanks(bankList);

    const cats = uc.listCategories.execute();
    setCategories(cats);

    const bankIdForFilter = selectedBankId === CASH_BANK_ID ? null : selectedBankId;
    const accs = uc.listAccounts.execute({ bankId: bankIdForFilter });
    setAccounts(accs);
    
    const defaultAccountId = selectedAccountId ?? accs[0]?.id ?? null;
    setSelectedAccountId(defaultAccountId);

    const list = uc.listTransactions.execute({ accountId: defaultAccountId ?? undefined });
    setTxs(list);

    if (!selectedCategoryId && cats[0]) setSelectedCategoryId(cats[0].id);
  }

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    const bankIdForFilter = selectedBankId === CASH_BANK_ID ? null : selectedBankId;
    const accs = uc.listAccounts.execute({ bankId: bankIdForFilter });
    setAccounts(accs);
    setSelectedAccountId(accs[0]?.id ?? null);
  }, [selectedBankId]);


  useEffect(() => {
    if (!selectedAccountId) {
      setTxs([]);
      return;
    };
    const list = uc.listTransactions.execute({ accountId: selectedAccountId });
    setTxs(list);
  }, [selectedAccountId]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) ?? null;

  function handleAddOrUpdateTransaction() {
    try {
      setError(null);

      if (!selectedAccountId) throw new Error("No account selected");
      if (!selectedCategoryId) throw new Error("No category selected");

      const category = categories.find(c => c.id === selectedCategoryId);
      if (!category) throw new Error("Category not found");

      const amt = Number(amountText.replace(",", "."));
      if (!Number.isFinite(amt)) throw new Error("Amount must be a number");

      const absAmount = Math.abs(amt);
      const signedAmount = category.type === 'EXPENSE' ? -absAmount : absAmount;
      
      const amountCents = Math.round(signedAmount * 100);

      const payload = {
        accountId: selectedAccountId,
        categoryId: selectedCategoryId,
        amountCents,
        description: desc.trim() || null,
        date: date.toISOString(),
      };

      if (editingTransactionId) {
        uc.updateTransaction.execute({ id: editingTransactionId, ...payload });
      } else {
        uc.createTransaction.execute(payload);
      }

      setDesc("");
      setAmountText("");
      setDate(new Date());
      setEditingTransactionId(null);
      reload();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function handleEdit(tx: Transaction) {
    setEditingTransactionId(tx.id);
    const account = uc.listAccounts.execute().find(a => a.id === tx.accountId);
    setSelectedBankId(account?.bankId ?? CASH_BANK_ID);
    setSelectedAccountId(tx.accountId);
    setSelectedCategoryId(tx.categoryId ?? null);
    setAmountText((Math.abs(tx.amountCents) / 100).toFixed(2));
    setDesc(tx.description ?? "");
    setDate(new Date(tx.date));
  }

  function handleCancelEdit() {
    setEditingTransactionId(null);
    setDesc("");
    setAmountText("");
    setDate(new Date());
  }

  function handleDelete(id: TransactionId) {
    uc.deleteTransaction.execute(id);
    reload();
  }

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>Transactions</Text>

      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <TextInput
            value={amountText}
            onChangeText={setAmountText}
            placeholder="Amount"
            keyboardType="decimal-pad"
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 }}
          />
          <View style={{ flex: 1 }}>
            <CompactSelect
              label="Category"
              value={selectedCategoryId}
              placeholder="Choose category"
              options={categories.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.type})`,
              }))}
              onChange={(v) => setSelectedCategoryId(v)}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="Description (e.g. Groceries)"
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 }}
          />
          <Pressable onPress={() => setShowDatePicker(true)} style={{ flex: 1, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 12, backgroundColor: '#e0e0e0' }}>
            <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>Date:</Text>
            <Text>{date.toLocaleDateString()}</Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ backgroundColor: 'white', padding: 16 }}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onChangeDate}
                />
                <Pressable onPress={() => setShowDatePicker(false)} style={{ borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 }}>
                  <Text>Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <CompactSelect
              label="Bank"
              value={selectedBankId}
              placeholder="Choose bank"
              options={[{ label: "Cash", value: CASH_BANK_ID }, ...banks.map((b) => ({
                value: b.id,
                label: b.name,
              }))]}
              onChange={(v) => setSelectedBankId(v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CompactSelect
              label="Account"
              value={selectedAccountId}
              placeholder="Choose account"
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.name} (${a.currency})`,
              }))}
              onChange={(v) => setSelectedAccountId(v)}
            />
          </View>
        </View>
        
        {selectedAccount && (
          <Text style={{ opacity: 0.7, textAlign: 'right', marginBottom: 8 }}>
            Balance: {formatCents(selectedAccount.balanceCents)} {selectedAccount.currency}
          </Text>
        )}

        {error && <Text style={{ color: "crimson", marginBottom: 8 }}>{error}</Text>}

        <View style={{ flexDirection: "row", gap: 8 }}>
          {editingTransactionId && (
            <Pressable onPress={handleCancelEdit} style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "gray" }}>
              <Text style={{ fontWeight: "700", color: "white" }}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleAddOrUpdateTransaction}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{editingTransactionId ? "Update Transaction" : "Add Transaction"}</Text>
          </Pressable>
        </View>
      </View>

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
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Pressable onPress={() => handleEdit(item)}><Text style={{ color: "blue" }}>Edit</Text></Pressable>
              <Pressable onPress={() => handleDelete(item.id)}><Text style={{ color: "crimson" }}>Delete</Text></Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No transactions yet.</Text>}
      />
    </SafeAreaView>
  );
}
