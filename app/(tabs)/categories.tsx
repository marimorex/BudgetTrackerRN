import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { Category, CategoryType } from "../../src/domain";
import { makeUseCases } from "../../src/usecases";
import { CategoryId } from "../../src/domain/types";

export default function CategoriesScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [editingCategoryId, setEditingCategoryId] = useState<CategoryId | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    const categoryList = uc.listCategories.execute();
    setCategories(categoryList);
  }

  useEffect(() => {
    reload();
  }, []);

  function handleAddOrUpdateCategory() {
    try {
      setError(null);
      if (!name.trim()) {
        throw new Error("Category name cannot be empty");
      }

      if (editingCategoryId) {
        uc.updateCategory.execute({
          id: editingCategoryId,
          name: name.trim(),
          type: type,
          description: description.trim(),
        });
      } else {
        uc.createCategory.execute({
          name: name.trim(),
          type: type,
          description: description.trim(),
        });
      }

      setName("");
      setDescription("");
      setEditingCategoryId(null);
      reload();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    }
  }

  function handleEdit(category: Category) {
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
    setType(category.type);
  }

  function handleCancelEdit() {
    setEditingCategoryId(null);
    setName("");
    setDescription("");
    setType("EXPENSE");
  }

  function handleDelete(id: CategoryId) {
    uc.deleteCategory.execute(id);
    reload();
  }

  const editingCategory = categories.find(c => c.id === editingCategoryId);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Categories</Text>

      {/* Form */}
      <View style={{ gap: 8 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Category Name (e.g. Groceries)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={() => setType("INCOME")} style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 12, alignItems: "center", backgroundColor: type === "INCOME" ? "blue" : "white" }}>
                <Text style={{ color: type === "INCOME" ? "white" : "black" }}>Income</Text>
            </Pressable>
            <Pressable onPress={() => setType("EXPENSE")} style={{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 12, alignItems: "center", backgroundColor: type === "EXPENSE" ? "red" : "white" }}>
                <Text style={{ color: type === "EXPENSE" ? "white" : "black" }}>Expense</Text>
            </Pressable>
        </View>

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}

        <View style={{ flexDirection: "row", gap: 8 }}>
          {editingCategoryId && (
            <Pressable
              onPress={handleCancelEdit}
              style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center", backgroundColor: "gray" }}
            >
              <Text style={{ fontWeight: "700", color: "white" }}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleAddOrUpdateCategory}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{editingCategoryId ? "Update Category" : "Add Category"}</Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ gap: 10, paddingTop: 8 }}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 }}>
            <Text style={{ fontWeight: "700" }}>{item.name}</Text>
            {item.description ? <Text>{item.description}</Text> : null}
            <Text style={{ color: item.type === "INCOME" ? "green" : "red" }}>{item.type}</Text>
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
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No categories found.</Text>}
      />
    </SafeAreaView>
  );
}
