import React from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

type Option = { label: string; value: string };

type Props = {
  label?: string;
  value: string | null;
  placeholder?: string;
  options: Option[];
  onChange: (value: string) => void;
};

export function CompactSelect({
  label,
  value,
  placeholder = "Select...",
  options,
  onChange,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <>
      {/* Single-row "dropdown" field */}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 12,
          justifyContent: "center",
          height: 52, // ✅ single row height
        }}
      >
        {label ? (
          <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>
            {label}
          </Text>
        ) : null}

        <Text numberOfLines={1} style={{ fontSize: 14 }}>
          {selectedLabel}
        </Text>
      </Pressable>

      {/* Modal list */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop */}
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            padding: 16,
            justifyContent: "center",
          }}
        >
          {/* Card */}
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              overflow: "hidden",
              maxHeight: "70%",
            }}
          >
            {/* Header */}
            <View
              style={{
                padding: 14,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                {label ?? "Select an option"}
              </Text>
            </View>

            {/* Options */}
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: "#eee" }} />
              )}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={{ paddingVertical: 14, paddingHorizontal: 14 }}
                >
                  <Text numberOfLines={1}>{item.label}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}