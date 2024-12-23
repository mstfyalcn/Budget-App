import { useState } from "react";
import { useBudget } from "../../context/BudgetContext";
import { useCategory } from "../../context/CategoryContext";
import styles from "./BudgetForm.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BudgetForm() {
  const { setTransactions, transactions } = useBudget();
  const { categories } = useCategory();
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransaction = {
      id: Date.now().toString(),
      type,
      category,
      description,
      amount: parseFloat(amount),
      date,
    };
   
    if (type === "expense") {
      const categoryBudget =
        categories.find((cat) => cat.name === category)?.budget ?? 0;
    
       
      const totalExpenseAmount = transactions
      .filter(
        (trans) => trans.category === category && trans.type === "expense"
      )
      .reduce((acc, trans) => acc + trans.amount, 0); 
       
      if (totalExpenseAmount + newTransaction.amount > categoryBudget) {
        toast.error(`"${category}" kategorisinin bütçesi %100'ünü aştı!`);
      } else if (totalExpenseAmount + newTransaction.amount === categoryBudget) {
        toast.warning(`"${category}" kategorisinin bütçesinin %100'üne ulaşıldı!`);
      } else if (totalExpenseAmount + newTransaction.amount >= categoryBudget * 0.8) {
        toast.warning(`"${category}" kategorisinin bütçesinin %80'ine ulaşıldı!`);
      }
    }
     
    setTransactions((prevTransactions) => {
      const updatedTransactions = [...prevTransactions, newTransaction];
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
      return updatedTransactions;
    });
 
    toast.success("İşlem başarıyla eklendi!");
 
    setCategory("");
    setDescription("");
    setAmount("");
    setDate("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles["form-container"]}>
        <h2>Bütçe Formu</h2>
        <div>
          <label>Tip:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
          >
            <option value="income">Gelir</option>
            <option value="expense">Gider</option>
          </select>
        </div>
        <div>
          <label>Kategori:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Kategori Seç</option>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((cat, index) =>
                cat && cat.name ? (
                  <option key={index} value={cat.name}>
                    {cat.name}
                  </option>
                ) : null
              )
            ) : (
              <option disabled>Kategoriler bulunamadı...</option>
            )}
          </select>
        </div>
        <div>
          <label>Açıklama:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Tutar:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Tarih:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.button}>
          Ekle
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}
