import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useTheme } from "../../context/ThemeContext";
import { SERIES_COLORS } from "../../utils/assetMeta";

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

export function useChartTheme() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    classes: dark ? SERIES_COLORS.dark : SERIES_COLORS.light,
    primary: dark ? "#3987e5" : "#2a78d6",
    benchmark: dark ? "#9ca3af" : "#6b7280",
    surface: dark ? "#111827" : "#ffffff",
    text: dark ? "#9ca3af" : "#6b7280",
    grid: dark ? "rgba(156,163,175,0.12)" : "rgba(107,114,128,0.15)",
  };
}
