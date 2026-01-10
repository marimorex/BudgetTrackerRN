import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeUseCases } from "../../src/usecases";
import { CategoryId, CategoryType } from "../../src/domain/types";
import { CompactSelect } from "../../components/CompactSelect";

export default function CategoryFormScreen() {
  const uc = useMemo(() => makeUseCases(), []);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingCategoryId = id as CategoryId | undefined;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [error, setError] = useState<string | null>(null);

  const categoryTypeOptions = [
    { label: "Income", value: "INCOME" },
    { label: "Expense", value: "EXPENSE" },
  ];

  useEffect(() => {
    if (editingCategoryId) {
      const category = uc.listCategories.execute().find((c) => c.id === editingCategoryId);
      if (category) {
        setName(category.name);
        setDescription(category.description ?? "");
        setType(category.type);
      }
    }
  }, [editingCategoryId]);

  function handleAddOrUpdateCategory() {
    try {
      setError(null);
      if (!name.trim()) {
        throw new Error("Category name cannot be empty");
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        type,
      };

      if (editingCategoryId) {
        uc.updateCategory.execute({ id: editingCategoryId, ...payload });
      } else {
        uc.createCategory.execute(payload);
      }

      router.back();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        {editingCategoryId ? "Edit Category" : "Create Category"}
      </Text>

      <View style={{ gap: 12 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Category Name (e.g. Groceries)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, height: 52 }}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, height: 52 }}
        />
        <CompactSelect
          label="Category Type"
          value={type}
          onChange={(v) => setType(v as CategoryType)}
          options={categoryTypeOptions}
        />

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "gray" }}
          >
            <Text style={{ fontWeight: "700", color: "white" }}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleAddOrUpdateCategory}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{editingCategoryId ? "Update Category" : "Add Category"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
