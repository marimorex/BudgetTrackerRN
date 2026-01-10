import { CompactSelect } from "@/components/CompactSelect";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account, Category, Transaction } from "../../src/domain";
import { AccountId, CategoryId, TransactionId } from "../../src/domain/types";
import { makeUseCases } from "../../src/usecases";

export default function TransactionFormScreen() {
  const uc = useMemo(() => makeUseCases(), []);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingTransactionId = id as TransactionId | undefined;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [accountId, setAccountId] = useState<AccountId | null>(null);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [description, setDescription] = useState("");
  const [amountText, setAmountText] = useState("");
  const [date, setDate] = useState(new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accs = uc.listAccounts.execute();
    const cats = uc.listCategories.execute();
    setAccounts(accs);
    setCategories(cats);
    
    if (editingTransactionId) {
      const tx = uc.listTransactions.execute().find(t => t.id === editingTransactionId);
      if (tx) {
        setAccountId(tx.accountId);
        setCategoryId(tx.categoryId);
        setDescription(tx.description ?? "");
        setAmountText((Math.abs(tx.amountCents) / 100).toFixed(2));
        setDate(new Date(tx.date));
      }
    } else {
      // Set default account and category on create
      if (accs.length > 0) setAccountId(accs[0].id);
      if (cats.length > 0) setCategoryId(cats[0].id);
    }
  }, [editingTransactionId]);


  function handleAddOrUpdateTransaction() {
    try {
      setError(null);

      if (!accountId) throw new Error("No account selected");
      if (!categoryId) throw new Error("No category selected");

      const category = categories.find(c => c.id === categoryId);
      if (!category) throw new Error("Category not found");

      const amt = Number(amountText.replace(",", "."));
      if (!Number.isFinite(amt) || amt <= 0) throw new Error("Amount must be a positive number");

      const signedAmount = category.type === 'EXPENSE' ? -amt : amt;
      const amountCents = Math.round(signedAmount * 100);

      const payload = {
        accountId,
        categoryId,
        amountCents,
        description: description.trim() || null,
        date: date.toISOString(),
      };

      if (editingTransactionId) {
        uc.updateTransaction.execute({ id: editingTransactionId, ...payload });
      } else {
        uc.createTransaction.execute(payload);
      }
      
      router.back();
    } catch (e: any) {
      setError(e.message);
    }
  }

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  const accountOptions = accounts.map(a => ({ label: `${a.name} (${a.currency})`, value: a.id }));
  const categoryOptions = categories.map(c => ({ label: `${c.name} (${c.type})`, value: c.id }));

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        {editingTransactionId ? "Edit Transaction" : "Add Transaction"}
      </Text>

      <View style={{ gap: 12 }}>
        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          placeholder="Amount"
          keyboardType="decimal-pad"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, height: 52 }}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (e.g. Groceries)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, height: 52 }}
        />
        
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <CompactSelect
              label="Account"
              value={accountId}
              onChange={v => setAccountId(v as AccountId)}
              options={accountOptions}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CompactSelect
              label="Category"
              value={categoryId}
              onChange={v => setCategoryId(v as CategoryId)}
              options={categoryOptions}
            />
          </View>
        </View>

        <Pressable onPress={() => setShowDatePicker(true)} style={{ borderWidth: 1, borderRadius: 12, justifyContent: 'center', padding: 12, height: 52 }}>
          <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>Date</Text>
          <Text>{date.toLocaleDateString()}</Text>
        </Pressable>

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
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                />
                <Pressable onPress={() => setShowDatePicker(false)} style={{ borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 }}>
                  <Text>Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        {error && <Text style={{ color: "crimson" }}>{error}</Text>}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
           <Pressable
            onPress={() => router.back()}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "gray" }}
          >
            <Text style={{ fontWeight: "700", color: "white" }}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleAddOrUpdateTransaction}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{editingTransactionId ? "Update" : "Add"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
