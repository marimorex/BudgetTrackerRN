import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Account, AccountType, Bank } from '../../src/domain';
import { makeUseCases } from '../../src/usecases';
import { CompactSelect } from '../../components/CompactSelect';
import { DatePicker } from '../../components/ui/date-picker';
import { ListAccountsAtDateUseCase } from '../../src/usecases/reports/ListAccountsAtDateUseCase';

function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${(abs / 100).toFixed(2)}`;
}

const ACCOUNT_TYPES: AccountType[] = ["CASH", "TDC", "SAVINGS", "CREDIT", "DEBIT", "INVESTMENTS"];

type SectionData = {
  title: string;
  data: Account[];
  total: number;
};

export default function CapitalScreen() {
  const uc = useMemo(() => makeUseCases(), []);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [filterType, setFilterType] = useState<AccountType | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      const listAccountsAtDateUseCase = new ListAccountsAtDateUseCase(uc.accountDao, uc.transactionDao);
      const fetchedAccounts = listAccountsAtDateUseCase.execute(selectedDate);
      const banks = uc.listBanks.execute();
      
      const filteredAccounts = filterType === 'all'
        ? fetchedAccounts
        : fetchedAccounts.filter(a => a.type === filterType);
      
      const assets = filteredAccounts
        .filter(a => a.type !== 'CREDIT')
        .reduce((sum, a) => sum + a.balanceCents, 0);
      
      const liabilities = filteredAccounts
        .filter(a => a.type === 'CREDIT')
        .reduce((sum, a) => sum + a.balanceCents, 0);

      setTotalAssets(assets);
      setTotalLiabilities(liabilities);
      setNetWorth(assets - liabilities);
      
      const groupedByBank = filteredAccounts.reduce((acc, account) => {
        const bankId = account.bankId || 'other';
        if (!acc[bankId]) {
          acc[bankId] = [];
        }
        acc[bankId].push(account);
        return acc;
      }, {} as Record<string, Account[]>);

      const bankNameMap = banks.reduce((acc, bank) => {
        acc[bank.id] = bank.name;
        return acc;
      }, {} as Record<string, string>);
      bankNameMap['other'] = 'Other';

      const newSections = Object.entries(groupedByBank).map(([bankId, accounts]) => {
        const total = accounts.reduce((sum, account) => {
          if (account.type === 'CREDIT') {
            return sum - account.balanceCents;
          }
          return sum + account.balanceCents;
        }, 0);
        return {
          title: bankNameMap[bankId],
          data: accounts,
          total: total,
        };
      });
      
      setSections(newSections);
    }, [uc, filterType, selectedDate])
  );

  const renderAccount = ({ item }: { item: Account }) => (
    <View style={styles.accountItem}>
      <Text style={styles.accountName}>{item.name}</Text>
      <Text style={styles.accountBalance}>{formatCents(item.balanceCents)}</Text>
    </View>
  );
  
  const accountTypeOptions = useMemo(() => [
    { label: "All Types", value: "all" },
    ...ACCOUNT_TYPES.map(type => ({ label: type, value: type }))
  ], []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Capital Summary</Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Assets</Text>
          <Text style={styles.summaryValue}>{formatCents(totalAssets)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Liabilities</Text>
          <Text style={[styles.summaryValue, {color: 'crimson'}]}>{formatCents(totalLiabilities)}</Text>
        </View>
        <View style={styles.netWorthRow}>
          <Text style={styles.summaryLabel}>Net Worth</Text>
          <Text style={styles.netWorthValue}>{formatCents(netWorth)}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Accounts by Bank</Text>

      <CompactSelect
        label="Filter by type"
        value={filterType}
        options={accountTypeOptions}
        onChange={value => setFilterType(value as AccountType | 'all')}
      />

      <View style={{ marginVertical: 12 }}>
        <Text style={{ textAlign: 'center', opacity: 0.6, marginBottom: 4 }}>
          Showing capital for: {selectedDate.toLocaleDateString()}
        </Text>
        <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </View>

      <SectionList
        sections={sections}
        renderItem={renderAccount}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionTotal}>{formatCents(section.total)}</Text>
          </View>
        )}
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
    backgroundColor: '#f9f9f9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  netWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  summaryLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  netWorthValue: {
    fontSize: 22,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
