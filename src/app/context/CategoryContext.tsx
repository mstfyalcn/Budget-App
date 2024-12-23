"use client";
import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

type Category = {
  name: string;
  budget: number;
  type: string; 
};

type CategoryContextType = {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (index: number, updatedCategory: Category) => void;
  removeCategory: (index: number) => void;
};

const defaultState: CategoryContextType = {
  categories: [],
  addCategory: () => {},
  updateCategory: () => {},
  removeCategory: () => {},
};

const CategoryContext = createContext<CategoryContextType>(defaultState);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => { 
    const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    setCategories(savedCategories);
  }, []);

  const addCategory = (category: Category) => {
    const updatedCategories = [...categories, category];
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const updateCategory = (index: number, updatedCategory: Category) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = updatedCategory;
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const removeCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);
