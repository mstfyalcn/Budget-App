import React, { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useBudget } from "../../context/BudgetContext";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { format, isThisMonth, isThisYear } from "date-fns";
import Button from "@mui/material/Button";
import styles from "./Chart.module.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

export default function ChartPage() {
  const { transactions } = useBudget();
  const [filter, setFilter] = useState<"monthly" | "yearly">("monthly");
 
  const calculateTotalForPeriod = (
    transactions: any[],
    period: "monthly" | "yearly"
  ) => {
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      if (
        (period === "monthly" && isThisMonth(date)) ||
        (period === "yearly" && isThisYear(date))
      ) {
        if (transaction.type === "income") {
          totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          totalExpense += transaction.amount;
        }
      }
    });

    return { totalIncome, totalExpense };
  };

  const { totalIncome, totalExpense } = calculateTotalForPeriod(
    transactions,
    filter
  );
  const balance = totalIncome - totalExpense;
 
  const filterTransactions = (
    transactions: any[],
    filter: "monthly" | "yearly"
  ) => {
    const groupedData: { [key: string]: { [key: string]: number } } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const key =
        filter === "monthly"
          ? `${date.getFullYear()}-${date.getMonth() + 1}`
          : `${date.getFullYear()}`;
      const category = `${transaction.type} - ${transaction.category}`;

      if (!groupedData[key]) groupedData[key] = {};
      groupedData[key][category] =
        (groupedData[key][category] || 0) + transaction.amount;
    });

    return groupedData;
  };

  const groupedData = filterTransactions(transactions, filter);

  const periods = Object.keys(groupedData);
  const categories = Object.keys(groupedData[periods[0]] || {});

  const chartDataBar = {
    labels: periods,
    datasets: categories.map((category) => {
      const isIncome = category.startsWith("income");
      return {
        label: category,
        data: periods.map((period) => groupedData[period][category] || 0),
        backgroundColor: isIncome
          ? "rgba(75, 192, 192, 0.6)"
          : "rgba(255, 99, 132, 0.6)",
        borderColor: isIncome
          ? "rgba(75, 192, 192, 1)"
          : "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      };
    }),
  };

  const chartDataPie = {
    labels: categories,
    datasets: [
      {
        label: "Gelir ve Gider Dağılımı",
        data: categories.map((category) => {
          return periods.reduce(
            (sum, period) => sum + (groupedData[period][category] || 0),
            0
          );
        }),
        backgroundColor: categories.map((category) =>
          category.startsWith("income")
            ? "rgba(75, 192, 192, 0.6)"
            : "rgba(255, 99, 132, 0.6)"
        ),
        borderColor: categories.map((category) =>
          category.startsWith("income")
            ? "rgba(75, 192, 192, 1)"
            : "rgba(255, 99, 132, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };
 
  const getExpenseData = () => {
    const expenseData: { [key: string]: number } = {};
 
    Object.keys(groupedData).forEach((period) => {
      Object.keys(groupedData[period]).forEach((category) => {
        if (category.startsWith("expense")) {
          expenseData[category] =
            (expenseData[category] || 0) + groupedData[period][category];
        }
      });
    });

    return expenseData;
  };
  const expenseData = getExpenseData();
 
  const maxExpenseCategory = Object.entries(expenseData).reduce(
    (max, [category, amount]) =>
      amount > max.amount ? { category, amount } : max,
    { category: "", amount: 0 }
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
 
    doc.setFontSize(18);
    doc.text("Aylık/Yıllık Gelir ve Gider Raporu", 20, 20);
 
    doc.setFontSize(12);
    doc.text(`Toplam Gelir: ${totalIncome} TL`, 20, 40);
    doc.text(`Toplam Gider: ${totalExpense} TL`, 20, 50);
    doc.text(`Kar-Zarar: ${balance} TL`, 20, 60);
 
    if (maxExpenseCategory.amount > 0) {
      doc.setTextColor(255, 0, 0); 
      doc.text(
        `⚠️ En yüksek harcama kategorisi: ${maxExpenseCategory.category} - ${maxExpenseCategory.amount} TL`,
        20,
        70
      );
    }

    const barChartElement = document.querySelector("#barChart") as HTMLElement;
    html2canvas(barChartElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 20, 80, 180, 100); 
      doc.save("gelir-gider-raporu.pdf");
    });
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw} TL`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={styles.container}>
       <h1>Grafikler</h1>
      <div className={styles["date-group"]}>
        <button
          className={`${styles.button} ${
            filter === "monthly" ? styles.active : ""
          }`}
          onClick={() => setFilter("monthly")}
        >
          Aylık
        </button>
        <button
          className={`${styles.button} ${
            filter === "yearly" ? styles.active : ""
          }`}
          onClick={() => setFilter("yearly")}
        >
          Yıllık
        </button>
      </div>

      <div className={styles["chart-container-wrapper"]}>
        <div className={styles["bar-container"]}>
          <h2>Gelir ve Gider Bar Grafiği</h2>
          <Bar data={chartDataBar} options={options} id="barChart" />
        </div>

        <div className={styles["pie-container"]}>
          <h2>Gelir ve Gider Pasta Grafiği</h2>
          <Pie data={chartDataPie} options={options} />
        </div>
      </div>
      <div className={styles["outer-container"]}>
        <div className={styles["totals-card"]}>
          <h4>
            {" "}
            {filter === "monthly" ? "Aylık" : "Yıllık"} Toplam Gelir:{" "}
            {totalIncome} TL
          </h4>
          <h4>
            {" "}
            {filter === "monthly" ? "Aylık" : "Yıllık"} Toplam Gider:{" "}
            {totalExpense} TL
          </h4>
          <h4>
            {" "}
            {filter === "monthly" ? "Aylık" : "Yıllık"} Kar-Zarar: {balance} TL
          </h4>

          {maxExpenseCategory.amount > 0 && (
            <div className={styles["alert"]}>
              <p>
                ⚠️ Bu yıl ki en yüksek harcama kategoriisi{" "}
                <strong>{maxExpenseCategory.category}</strong>{" "} 
                Toplam <strong>{maxExpenseCategory.amount} TL.</strong>
              </p>
            </div>
          )}
        </div>
        <div className="button-container">
          <Button variant="contained" color="primary" onClick={generatePDF}>
            PDf İndir
          </Button>
        </div>
      </div>
    </div>
  );
}
