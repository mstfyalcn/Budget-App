"use client";

import { useState, useEffect } from "react";
import { useBudget } from "../../context/BudgetContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./BudgetList.module.css";
import { ToastContainer } from "react-toastify";

export default function BudgetList() {
  
  const { transactions, setTransactions } = useBudget();
 
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);

  useEffect(() => {}, [setTransactions]);

  const handleDelete = (id: string) => {
    const isConfirmed = window.confirm(
      "Bu işlemi silmek istediğinizden emin misiniz?"
    );
    if (isConfirmed) {
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction.id !== id)
      );
      toast.error("Kategori başarıyla silindi!");
    }
  };
 
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;

  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDescription, setFilterDescription] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (filterType ? transaction.type === filterType : true) &&
      (filterCategory
        ? transaction.category
            .toLowerCase()
            .includes(filterCategory.toLowerCase())
        : true) &&
      (filterDescription
        ? transaction.description
            .toLowerCase()
            .includes(filterDescription.toLowerCase())
        : true) &&
      (filterDate ? transaction.date.includes(filterDate) : true)
    );
  });
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
 
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
 
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  return (
    <div className={styles["list-container"]}>
      <h1>Bütçe Listesi</h1>

      <div className={styles["filter-container"]}>
        <input
          type="text"
          placeholder="Kategori Ara"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles["filter-input"]}
        />
        <input
          type="text"
          placeholder="Açıklama Ara"
          value={filterDescription}
          onChange={(e) => setFilterDescription(e.target.value)}
          className={styles["filter-input"]}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={styles["filter-input"]}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={styles["filter-input"]}
        >
          <option value="">Tip Seç ve Ara</option>
          <option value="income">Gelir</option>
          <option value="expense">Gider</option>
        </select>
      </div>
      {filteredTransactions.length === 0 ? (
        <p className={styles["empty-message"]}>Henüz eklenmiş bir işlem yok.</p>
      ) : (
        <table className={styles["table"]}>
          <thead>
            <tr>
              <th>Tip</th>
              <th>Kategori</th>
              <th>Açıklama</th>
              <th>Tutar</th>
              <th>Tarih</th>
              <th>Sil</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.type === "income" ? "Gelir" : "Gider"}</td>
                <td>{transaction.category}</td>
                <td>{transaction.description}</td>
                <td>{transaction.amount.toFixed(2)} TL</td>
                <td>{transaction.date}</td>
                <td>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className={styles["delete-button"]}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
 
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
            className={`${styles["pagination-button"]} ${
              currentPage === index + 1 ? styles["active"] : ""
            }`}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
