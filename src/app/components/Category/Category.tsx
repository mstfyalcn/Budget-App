"use client";

import React, { useState } from "react";
import { useCategory } from "../../context/CategoryContext";
import styles from "./CategoryForm.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryForm = () => {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState<number>(0);
  const [categoryType, setCategoryType] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const { categories, addCategory, updateCategory, removeCategory } = useCategory();
  const [transactionsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => {
    setName("");
    setBudget(0);
    setCategoryType(""); 
    setEditIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
 
    const existingCategory = categories.find(
      (category) => category.name === name && category.type === categoryType
    );

    if (existingCategory && editIndex === null) {
      toast.error("Bu isim ve türde bir kategori zaten mevcut!");
      return;
    }

    if (editIndex !== null) {
      updateCategory(editIndex, { name, budget, type: categoryType });
      toast.success("Kategori başarıyla güncellendi!");
    } else if (name && (categoryType !== "" || budget > 0)) {
      addCategory({ name, budget, type: categoryType });
      toast.success("Kategori başarıyla eklendi!");
    }

    resetForm();
  };

  const handleDelete = (index: number) => {
    const isConfirmed = window.confirm("Bu işlemi silmek istediğinizden emin misiniz?");
    if (isConfirmed) {
      removeCategory(index);
      toast.error("Kategori başarıyla silindi!");
    }
  };

  const handleEdit = (index: number) => {
    setName(categories[index]?.name || "");
    setBudget(categories[index]?.budget || 0);
    setCategoryType(categories[index]?.type || ""); 
    setEditIndex(index);
  };
  
  const indexOfLastCategory = currentPage * transactionsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - transactionsPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(categories.length / transactionsPerPage);

  return (
    <div className={styles.container}>
      <h2>Kategoriler</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Kategori Adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />

        <select
          value={categoryType}
          onChange={(e) => setCategoryType(e.target.value)}
          className={styles.input}
        >
          <option value="">Kategori tipini seçiniz</option>
          <option value="Gelir">Gelir</option>
          <option value="Gider">Gider</option>
        </select>

        {categoryType === "Gider" && (
          <input
            type="number"
            placeholder="Bütçe"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className={styles.input}
          />
        )}

        <button type="submit" className={styles.button}>
          {editIndex !== null ? "Güncelle" : "Ekle"}
        </button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Kategori Adı</th>
            <th>Türü</th>
            <th>Bütçe Limiti</th>
            <th>Düzenle</th>
            <th>Sil</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(currentCategories) && currentCategories.length > 0 ? (
            currentCategories.map((category, index) => (
              <tr key={index}>
                <td>{category?.name || "Bilinmiyor"}</td>
                <td>{category?.type || "Bilinmiyor"}</td>
                <td>{category?.budget ? `${category.budget}₺` : "-"}</td>
                <td>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(index)}
                  >
                    Güncelle
                  </button>
                </td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(index)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className={styles.noData}>
                Kategoriler bulunamadı
              </td>
            </tr>
          )}
        </tbody>
      </table>
 
      <div className={styles["pagination"]}>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles["pagination-button"]}
        >
          Önceki
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`${styles["pagination-button"]} ${currentPage === index + 1 ? styles["active"] : ""}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles["pagination-button"]}
        >
          Sonraki
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default CategoryForm;
