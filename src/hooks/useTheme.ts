import { useContext } from "react";
import {
  ThemeContext,
  type ThemeContextValue,
} from "../contexts/themeContextValue";

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a <ThemeProvider>");
  }
  return context;
}

export default useTheme;
