import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account, AccountType, Bank, CurrencyType } from "../../src/domain";
import { AccountId, BankId } from "../../src/domain/types";
import { makeUseCases } from "../../src/usecases";
import { CompactSelect } from "../../components/CompactSelect";

export default function AccountFormScreen() {
  const uc = useMemo(() => makeUseCases(), []);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingAccountId = id as AccountId | undefined;

  const [banks, setBanks] = useState<Bank[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("CASH");
  const [currency, setCurrency] = useState<CurrencyType>("EUR");
  const [balance, setBalance] = useState("0");
  const [selectedBankId, setSelectedBankId] = useState<BankId | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bankList = uc.listBanks.execute();
    setBanks(bankList);

    if (editingAccountId) {
      const account = uc.listAccounts.execute().find((a) => a.id === editingAccountId);
      if (account) {
        setName(account.name);
        setType(account.type);
        setCurrency(account.currency);
        setBalance((account.balanceCents / 100).toFixed(2));
        setSelectedBankId(account.bankId ?? null);
      }
    }
  }, [editingAccountId]);

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
        bankId: type === "CASH" ? null : selectedBankId,
      };

      if (editingAccountId) {
        uc.updateAccount.execute({ id: editingAccountId, ...payload });
      } else {
        uc.createAccount.execute(payload);
      }

      router.back();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    }
  }

  const accountTypeOptions = (["CASH", "CURRENT", "CREDIT_CARD", "SAVINGS", "CREDIT"] as AccountType[]).map(t => ({ label: t.replace(/_/g, ' '), value: t }));
  const currencyOptions = (["EUR", "USD"] as CurrencyType[]).map(c => ({ label: c, value: c }));
  const bankOptions = banks.map(b => ({ label: b.name, value: b.id }));

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        {editingAccountId ? "Edit Account" : "Create Account"}
      </Text>

      {/* Form */}
      <View style={{ gap: 12 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Account Name"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, height: 52 }}
        />
        <TextInput
          value={balance}
          onChangeText={setBalance}
          placeholder="Initial Balance"
          keyboardType="decimal-pad"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, height: 52 }}
          editable={!editingAccountId} // Only allow setting initial balance on creation
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <CompactSelect
              label="Account Type"
              value={type}
              onChange={(v) => setType(v as AccountType)}
              options={accountTypeOptions}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CompactSelect
              label="Currency"
              value={currency}
              onChange={(v) => setCurrency(v as CurrencyType)}
              options={currencyOptions}
            />
          </View>
        </View>

        {type !== "CASH" && (
          <CompactSelect
            label="Bank"
            value={selectedBankId}
            onChange={(v) => setSelectedBankId(v as BankId)}
            options={bankOptions}
            placeholder="Select a bank..."
          />
        )}
        
        {type !== "CASH" && banks.length === 0 && (
          <Text style={{ color: "crimson", padding: 4 }}>No banks found. Create one first in the Banks tab.</Text>
        )}

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "gray" }}
          >
            <Text style={{ fontWeight: "700", color: "white" }}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleAddOrUpdateAccount}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{editingAccountId ? "Update Account" : "Add Account"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
