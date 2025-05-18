import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  currencyCode: string;
  currencyName: string;
  type: 'buy' | 'sell';
  amount: number;
  rate: number;
  targetCurrency: 'USD' | 'EUR';
  total: number;
  timestamp: string;
}

const STORAGE_KEY = '@transactions';

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    try {
      const newTransactions = [transaction, ...transactions];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setTransactions([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return {
    transactions,
    addTransaction,
    clearHistory,
  };
}