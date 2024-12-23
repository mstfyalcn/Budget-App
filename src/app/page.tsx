"use client";

import { useState } from "react";
import { BudgetProvider } from "./context/BudgetContext";
import BudgetForm from "./components/BudgetForm/BudgetForm";
import BudgetList from "./components/BudgetList/BudgetList";
import ChartPage from "./components/Chart/Chart";
import CategoryForm from "./components/Category/Category";
import { CategoryProvider } from "./context/CategoryContext";
import styles from "./page.module.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import * as React from "react";
import Box from "@mui/material/Box";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel"; 
export default function Home() {
  const [activeComponent, setActiveComponent] = useState<
    "form" | "list" | "chart" | "category" | null
  >("form");
  const [mode, setMode] = useState<"light" | "dark">("light");

  const theme = createTheme({
    palette: {
      mode: mode,
      ...(mode === "dark" && {
        background: {
          default: "#121212",
        },
        text: {
          primary: "#000000",
        },
      }),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          color: "text.primary",
          borderRadius: 1,
          p: 3,
          minHeight: "56px",
        }}
      >
        <FormControl> 
          <RadioGroup
            aria-labelledby="demo-theme-toggle"
            name="theme-toggle"
            row
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as "light" | "dark")
            }
          >
            <FormControlLabel
              value="light"
              control={<Radio />}
              label="Aydınlşık Mod"
            />
            <FormControlLabel
              value="dark"
              control={<Radio />}
              label="Karanlık Mod"
            />
          </RadioGroup>

          <BudgetProvider>
            <CategoryProvider>
              <main className={styles.container}> 
                <div className={styles.buttonContainer}>
                  <button
                    className={styles.button}
                    onClick={() => setActiveComponent("form")}
                  >
                    Bütçe Formu
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => setActiveComponent("list")}
                  >
                    Bütçe Listesi
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => setActiveComponent("category")}
                  >
                    Kategoriler
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => setActiveComponent("chart")}
                  >
                    Grafikler
                  </button>
                </div>

                {activeComponent === "form" && <BudgetForm />}
                {activeComponent === "list" && <BudgetList />}
                {activeComponent === "category" && <CategoryForm />}
                {activeComponent === "chart" && <ChartPage />}
              </main>
            </CategoryProvider>
          </BudgetProvider>
        </FormControl>
      </Box>
    </ThemeProvider>
  );
}
