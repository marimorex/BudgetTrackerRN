import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bank } from "../../src/domain";
import { makeUseCases } from "../../src/usecases";
import { BankId } from "../../src/domain/types";

export default function BanksScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingBankId, setEditingBankId] = useState<BankId | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    const bankList = uc.listBanks.execute();
    setBanks(bankList);
  }

  useEffect(() => {
    reload();
  }, []);

  function handleAddOrUpdateBank() {
    try {
      setError(null);
      if (!name.trim()) {
        throw new Error("Bank name cannot be empty");
      }

      if (editingBankId) {
        uc.updateBank.execute({
          id: editingBankId,
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        uc.createBank.execute({
          name: name.trim(),
          description: description.trim(),
        });
      }

      setName("");
      setDescription("");
      setEditingBankId(null);
      reload();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    }
  }

  function handleEdit(bank: Bank) {
    setEditingBankId(bank.id);
    setName(bank.name);
    setDescription(bank.description ?? "");
  }

  function handleCancelEdit() {
    setEditingBankId(null);
    setName("");
    setDescription("");
  }

  function handleDelete(id: BankId) {
    uc.deleteBank.execute(id);
    reload();
  }

  const editingBank = banks.find(b => b.id === editingBankId);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Banks</Text>

      {/* Form */}
      <View style={{ gap: 8 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Bank Name (e.g. My Bank)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}

        <View style={{ flexDirection: "row", gap: 8 }}>
          {editingBankId && (
            <Pressable
              onPress={handleCancelEdit}
              style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "gray" }}
            >
              <Text style={{ fontWeight: "700", color: "white" }}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleAddOrUpdateBank}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{editingBankId ? "Update Bank" : "Add Bank"}</Text>
          </Pressable>
        </View>
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
              <Pressable onPress={() => handleEdit(item)}>
                <Text style={{ color: "blue" }}>Edit</Text>
              </Pressable>
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
