import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { makeUseCases } from '../../src/usecases';
import { Account } from '../../src/domain';

function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${(abs / 100).toFixed(2)}`;
}

export default function CapitalScreen() {
  const uc = useMemo(() => makeUseCases(), []);
  const accounts = uc.listAccounts.execute();

  const totalCapital = accounts.reduce((sum, account) => {
    if (account.type === 'CREDIT_CARD' || account.type === 'CREDIT') {
      return sum - account.balanceCents;
    }
    return sum + account.balanceCents;
  }, 0);

  const renderAccount = ({ item }: { item: Account }) => (
    <View style={styles.accountItem}>
      <Text style={styles.accountName}>{item.name}</Text>
      <Text style={styles.accountBalance}>{formatCents(item.balanceCents)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Capital Summary</Text>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Total Capital</Text>
        <Text style={styles.summaryValue}>{formatCents(totalCapital)}</Text>
      </View>

      <Text style={styles.subtitle}>Accounts</Text>
      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  summaryContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  summaryLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  accountName: {
    fontSize: 16,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
});
