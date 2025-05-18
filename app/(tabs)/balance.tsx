import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { COLORS } from '@/constants/Colors';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { formatCurrency } from '@/utils/formatters';
import { CURRENCIES } from '@/data/currencies';
import EmptyState from '@/components/EmptyState';

export default function BalanceScreen() {
  const { transactions } = useTransactionHistory();

  // Calculate balance for each currency in DZD
  const balances = React.useMemo(() => {
    const balanceMap = new Map();

    transactions.forEach(transaction => {
      const key = transaction.currencyCode;
      const currentBalance = balanceMap.get(key) || {
        buys: 0,
        sells: 0,
        currency: CURRENCIES.find(c => c.code === key),
      };

      // Convert all amounts to DZD using the transaction rate
      const amountInDZD = transaction.amount * transaction.rate;

      if (transaction.type === 'buy') {
        currentBalance.buys += amountInDZD;
      } else {
        currentBalance.sells += amountInDZD;
      }

      balanceMap.set(key, currentBalance);
    });

    return Array.from(balanceMap.entries()).map(([code, data]) => ({
      code,
      ...data,
      netTotal: data.buys - data.sells,
    }));
  }, [transactions]);

  const renderBalanceItem = ({ item }) => (
    <View style={styles.balanceItem}>
      <View style={styles.currencyInfo}>
        <Image source={{ uri: item.currency.flagUrl }} style={styles.flag} />
        <View style={styles.currencyDetails}>
          <Text style={styles.currencyName}>{item.currency.name}</Text>
          <Text style={styles.currencyCode}>{item.code}</Text>
        </View>
      </View>
      <View style={styles.balanceDetails}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Total Buys:</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(item.buys, 'DZD')}
          </Text>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Total Sells:</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(item.sells, 'DZD')}
          </Text>
        </View>
        <View style={[styles.balanceRow, styles.netTotalRow]}>
          <Text style={styles.netTotalLabel}>Net Total:</Text>
          <Text style={[
            styles.netTotalValue,
            item.netTotal > 0 ? styles.positive : styles.negative
          ]}>
            {formatCurrency(item.netTotal, 'DZD')}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Balance Summary" />
      
      {balances.length > 0 ? (
        <FlatList
          data={balances}
          renderItem={renderBalanceItem}
          keyExtractor={item => item.code}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="No transactions yet"
          description="Your balance summary will appear here once you make transactions"
          icon="history"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  balanceItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flag: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  currencyDetails: {
    marginLeft: 12,
  },
  currencyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.text,
  },
  currencyCode: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  balanceDetails: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.text,
  },
  netTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 0,
  },
  netTotalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.text,
  },
  netTotalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  positive: {
    color: COLORS.success,
  },
  negative: {
    color: COLORS.error,
  },
});