import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account, AccountType, Bank, CurrencyType } from "../../src/domain";
import { makeUseCases } from "../../src/usecases";
import { AccountId, BankId } from "../../src/domain/types";

// A simple segmented control
function SegmentedControl<T extends string>({ options, value, onValueChange }: { options: T[], value: T, onValueChange: (value: T) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {options.map(option => (
        <Pressable
          key={option}
          onPress={() => onValueChange(option)}
          style={{
            flex: 1,
            padding: 12,
            borderWidth: 1,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor: value === option ? "blue" : "white",
          }}
        >
          <Text style={{ color: value === option ? "white" : "black", textTransform: 'capitalize' }}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}


export default function AccountsScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CASH");
  const [currency, setCurrency] = useState<CurrencyType>("EUR");
  const [balance, setBalance] = useState("0");
  const [selectedBankId, setSelectedBankId] = useState<BankId | null>(null);
  
  const [editingAccountId, setEditingAccountId] = useState<AccountId | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    const accountList = uc.listAccounts.execute();
    setAccounts(accountList);
    const bankList = uc.listBanks.execute();
    setBanks(bankList);
  }

  useEffect(() => {
    reload();
  }, []);

  function handleAddOrUpdateAccount() {
    try {
      setError(null);
      if (!name.trim()) throw new Error("Account name cannot be empty");

      const balanceCents = Math.round(Number(balance.replace(",", ".")) * 100);
      if (!Number.isFinite(balanceCents)) throw new Error("Invalid balance");

      const payload = {
        name: name.trim(),
        type,
        currency,
        balanceCents,
        bankId: type === 'CASH' ? null : selectedBankId,
      };

      if (editingAccountId) {
        uc.updateAccount.execute({ id: editingAccountId, ...payload });
      } else {
        uc.createAccount.execute(payload);
      }

      // Reset form
      setName("");
      setType("CASH");
      setCurrency("EUR");
      setBalance("0");
      setSelectedBankId(null);
      setEditingAccountId(null);
      reload();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    }
  }

  function handleEdit(account: Account) {
    setEditingAccountId(account.id);
    setName(account.name);
    setType(account.type);
    setCurrency(account.currency);
    setBalance((account.balanceCents / 100).toFixed(2));
    setSelectedBankId(account.bankId ?? null);
  }

  function handleCancelEdit() {
    setEditingAccountId(null);
    setName("");
    setType("CASH");
    setCurrency("EUR");
    setBalance("0");
    setSelectedBankId(null);
  }

  function handleDelete(id: AccountId) {
    uc.deleteAccount.execute(id);
    reload();
  }
  
  const accountTypes: AccountType[] = ["CASH", "CURRENT", "CREDIT_CARD", "SAVINGS", "CREDIT"];
  const currencyTypes: CurrencyType[] = ["EUR", "USD"];

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Accounts</Text>

      {/* Form */}
      <View style={{ gap: 8 }}>
        <TextInput value={name} onChangeText={setName} placeholder="Account Name" style={{ borderWidth: 1, borderRadius: 12, padding: 12 }} />
        <TextInput value={balance} onChangeText={setBalance} placeholder="Initial Balance" keyboardType="decimal-pad" style={{ borderWidth: 1, borderRadius: 12, padding: 12 }} />
        <SegmentedControl options={accountTypes} value={type} onValueChange={setType} />
        <SegmentedControl options={currencyTypes} value={currency} onValueChange={setCurrency} />

        {type !== 'CASH' && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600" }}>Bank</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {banks.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => setSelectedBankId(b.id)}
                  style={{
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    backgroundColor: selectedBankId === b.id ? "blue" : "white",
                  }}
                >
                  <Text style={{ color: selectedBankId === b.id ? "white" : "black" }}>{b.name}</Text>
                </Pressable>
              ))}
            </View>
            {banks.length === 0 && <Text style={{ color: "crimson" }}>No banks found. Create one first.</Text>}
          </View>
        )}

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}

        <View style={{ flexDirection: "row", gap: 8 }}>
          {editingAccountId && (
            <Pressable onPress={handleCancelEdit} style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "gray" }}>
              <Text style={{ fontWeight: "700", color: "white" }}>Cancel</Text>
            </Pressable>
          )}
          <Pressable onPress={handleAddOrUpdateAccount} style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>{editingAccountId ? "Update Account" : "Add Account"}</Text>
          </Pressable>
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
              <Pressable onPress={() => handleEdit(item)}><Text style={{ color: "blue" }}>Edit</Text></Pressable>
              <Pressable onPress={() => handleDelete(item.id)}><Text style={{ color: "crimson" }}>Delete</Text></Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No accounts found.</Text>}
      />
    </SafeAreaView>
  );
}
