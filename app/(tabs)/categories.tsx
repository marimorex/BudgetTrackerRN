import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Category, CategoryType } from "../../src/domain";
import { makeUseCases } from "../../src/usecases";
import { CategoryId } from "../../src/domain/types";
import { Link, useFocusEffect } from "expo-router";
import { CompactSelect } from "../../components/CompactSelect";

export default function CategoriesScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [filterType, setFilterType] = useState<CategoryType | "all">("all");

  const categoryTypeOptions = [
    { label: "All Types", value: "all" },
    { label: "Income", value: "INCOME" },
    { label: "Expense", value: "EXPENSE" },
  ];

  function reload() {
    const filter = filterType === "all" ? {} : { type: filterType };
    const categoryList = uc.listCategories.execute(filter);
    setCategories(categoryList);
  }

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [filterType])
  );

  function handleDelete(id: CategoryId) {
    try {
      uc.deleteCategory.execute(id);
      reload();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Categories</Text>
        <Link href="/categories/form" asChild>
          <Pressable style={{ borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Create Category</Text>
          </Pressable>
        </Link>
      </View>

      {/* Filter */}
      <CompactSelect
        value={filterType}
        onChange={(v) => setFilterType(v as CategoryType | "all")}
        options={categoryTypeOptions}
      />

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
              <Link href={{ pathname: "/categories/form", params: { id: item.id } }} asChild>
                <Pressable>
                  <Text style={{ color: "blue" }}>Edit</Text>
                </Pressable>
              </Link>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={{ color: "crimson" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.7, textAlign: "center" }}>No categories found.</Text>}
      />
    </SafeAreaView>
  );
}
