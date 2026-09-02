import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  dark: false,
  toggle: () => {},
});

function getInitial() {
  const stored = localStorage.getItem("theme");

  if (stored) {
    return stored === "dark";
  }

  return false;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitial);

  const toggle = () => {
    setDark(!dark);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    localStorage.setItem(
      "theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}