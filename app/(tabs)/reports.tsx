import { CompactSelect } from '@/components/CompactSelect';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Account, Category } from '../../src/domain';
import { makeUseCases } from '../../src/usecases';
import { MonthlySummary } from '../../src/usecases/reports/GetMonthlySummaryUseCase';

function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${(abs / 100).toFixed(2)}`;
}

const ALL_FILTER = "ALL";

export default function ReportsScreen() {
  const uc = useMemo(() => makeUseCases(), []);

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedAccountId, setSelectedAccountId] = useState<string>(ALL_FILTER);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_FILTER);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [monthlyCapital, setMonthlyCapital] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useFocusEffect(
    useCallback(() => {
      setAccounts(uc.listAccounts.execute());
      setCategories(uc.listCategories.execute());
    }, [uc])
  );

  function handleGenerateReport() {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    const filters = {
      year: yearNum,
      month: monthNum,
      accountId: selectedAccountId === ALL_FILTER ? undefined : selectedAccountId,
      categoryId: selectedCategoryId === ALL_FILTER ? undefined : selectedCategoryId,
    };
     console.log(filters)
    const summaryData = uc.getMonthlySummary.execute(filters);
    setSummary(summaryData);

    const endOfMonth = new Date(yearNum, monthNum, 0);
    console.log(endOfMonth)

    const capitalAtMonthEnd = uc.getCapitalAtDate.execute(endOfMonth);
    setMonthlyCapital(capitalAtMonthEnd);
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i+1).toString(),
    label: new Date(2024, i, 1).toLocaleString('default', { month: 'long' }),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reports</Text>

      <View style={styles.filtersContainer}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={year}
            onChangeText={setYear}
            placeholder="Year"
            keyboardType="number-pad"
            style={{ flex: 1, ...styles.input }}
          />
          <View style={{ flex: 2 }}>
            <CompactSelect
              label="Month"
              value={month}
              options={monthOptions}
              onChange={setMonth}
            />
          </View>
        </View>
        <CompactSelect
          label="Account"
          value={selectedAccountId}
          options={[{ label: "All Accounts", value: ALL_FILTER }, ...accounts.map(a => ({ label: a.name, value: a.id }))]}
          onChange={setSelectedAccountId}
        />
        <CompactSelect
          label="Category"
          value={selectedCategoryId}
          options={[{ label: "All Categories", value: ALL_FILTER }, ...categories.map(c => ({ label: c.name, value: c.id }))]}
          onChange={setSelectedCategoryId}
        />
        <Pressable onPress={handleGenerateReport} style={styles.button}>
          <Text style={styles.buttonText}>Generate Report</Text>
        </Pressable>
      </View>

      <View style={styles.summaryWrapper}>
        {summary ? (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Monthly Summary</Text>
            <View style={styles.summaryRow}>
              <Text>Total Income:</Text>
              <Text style={{color: 'green'}}>{formatCents(summary.totalIncome)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Total Expenses:</Text>
              <Text style={{color: 'red'}}>{formatCents(summary.totalExpenses)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{fontWeight: 'bold'}}>Net Savings:</Text>
              <Text style={{fontWeight: 'bold'}}>{formatCents(summary.netSavings)}</Text>
            </View>
            {monthlyCapital !== null && (
              <View style={styles.summaryRow}>
                <Text style={{fontWeight: 'bold'}}>Capital at End of Month:</Text>
                <Text style={{fontWeight: 'bold'}}>{formatCents(monthlyCapital)}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.summaryContainer, {minHeight: 150, justifyContent: 'center', alignItems: 'center'}]}>
            <Text style={{opacity: 0.7}}>Generate a report to see the summary.</Text>
          </View>
        )}
      </View>
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
  filtersContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  button: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  summaryWrapper: {
    flex: 1,
  },
  summaryContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  }
});
