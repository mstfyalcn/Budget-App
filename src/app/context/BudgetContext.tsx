 
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
}

interface BudgetContextType {
  transactions: Transaction[];
  budgetLimit: number | null;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setBudgetLimit: React.Dispatch<React.SetStateAction<number | null>>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
 
  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    const storedBudgetLimit = localStorage.getItem("budgetLimit");
    
    setTransactions(storedTransactions);
    setBudgetLimit(storedBudgetLimit ? parseFloat(storedBudgetLimit) : null);
  }, []);

  return (
    <BudgetContext.Provider value={{ transactions, budgetLimit, setTransactions, setBudgetLimit }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("...");
  }
  return context;
};
