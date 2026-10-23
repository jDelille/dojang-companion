import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

/*
   Dashboard visuals ported from tailwind/src/assets/js/dashboard.js.

   Colours are hardcoded and tooltips pinned to the dark theme because the
   template behaves that way too — only the CSS-driven pieces (heatmap cells,
   renewal dots) follow light mode, via :root.mode-light rules in style.css.

   Every options object is module-level: they never change, so building them
   once keeps ApexCharts from diffing a new object on each render.
*/

const FONT = "Inter, sans-serif";

/* ---------- Revenue sparkline (KPI card) ---------- */

const SPARKLINE_SERIES = [{ name: "Revenue", data: [12, 20, 16, 32, 28, 44, 50, 56] }];

const SPARKLINE_OPTIONS: ApexOptions = {
  chart: {
    type: "area",
    height: 64,
    background: "transparent",
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 800 },
    sparkline: { enabled: true }, // removes internal padding — true edge-to-edge
  },
  stroke: { curve: "smooth", width: 2.5, colors: ["#F4D03F"] },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "vertical",
      shadeIntensity: 0,
      gradientToColors: ["#D4AF37"],
      opacityFrom: 0.35,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  markers: {
    // Only the final point carries a dot.
    size: [0, 0, 0, 0, 0, 0, 0, 4],
    colors: ["#F4D03F"],
    strokeColors: "#0B0B0C",
    strokeWidth: 2,
    hover: { size: 0 },
  },
  colors: ["#D4AF37"],
  dataLabels: { enabled: false },
  legend: { show: false },
  states: {
    hover: { filter: { type: "none" } },
    active: { filter: { type: "none" } },
  },
  xaxis: { crosshairs: { show: false }, tooltip: { enabled: false } },
  yaxis: { min: 0 },
  tooltip: { enabled: false },
};

export const RevenueSparkline = () => (
  <Chart options={SPARKLINE_OPTIONS} series={SPARKLINE_SERIES} type="area" height={64} />
);

/* ---------- PT mini-bars ---------- */

const PT_SERIES = [{ name: "Sessions", data: [40, 55, 35, 70, 50, 85, 100] }];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PT_OPTIONS: ApexOptions = {
  chart: {
    type: "bar",
    height: 78,
    background: "transparent",
    toolbar: { show: false },
    animations: { enabled: false },
    sparkline: { enabled: false },
    parentHeightOffset: 0,
    offsetX: 0,
    offsetY: 0,
  },
  // Today (last bar) is highlighted against the muted week.
  colors: ["#555a9c", "#555a9c", "#555a9c", "#555a9c", "#555a9c", "#555a9c", "#a78bfa"],
  plotOptions: {
    bar: { borderRadius: 4, columnWidth: "72%", distributed: true },
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { show: false, padding: { top: 0, bottom: 0, left: -6, right: -6 } },
  xaxis: {
    categories: DAYS,
    labels: {
      show: true,
      style: {
        colors: Array(7).fill("#6B7280") as string[],
        fontSize: "9px",
        fontFamily: FONT,
        fontWeight: 400,
      },
      offsetY: -2,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    crosshairs: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  tooltip: { enabled: false },
};

export const PtBars = () => (
  <Chart options={PT_OPTIONS} series={PT_SERIES} type="bar" height={78} />
);

/* ---------- Hourly footfall ---------- */

// 14 points: 6 AM through 9 PM, hour by hour.
const FOOTFALL_DATA = [30, 48, 62, 40, 34, 46, 58, 44, 52, 70, 88, 100, 76, 54];

const FOOTFALL_PEAK = Math.max(...FOOTFALL_DATA);

const FOOTFALL_SERIES = [{ name: "Visitors", data: FOOTFALL_DATA }];

const FOOTFALL_OPTIONS: ApexOptions = {
  chart: {
    type: "bar",
    height: 70,
    background: "transparent",
    toolbar: { show: false },
    animations: { enabled: false },
    parentHeightOffset: 0,
    offsetX: 0,
    offsetY: 0,
  },
  // Derived, not authored: the busiest hour picks up the bright gold.
  colors: FOOTFALL_DATA.map((v) => (v === FOOTFALL_PEAK ? "#F4D03F" : "#B8860B")),
  plotOptions: {
    bar: {
      distributed: true,
      columnWidth: "55%",
      borderRadius: 4,
      borderRadiusApplication: "end",
    },
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { show: false, padding: { left: -30, right: -10, top: 0, bottom: -20 } },
  xaxis: {
    tickPlacement: "on",
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    crosshairs: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  tooltip: {
    enabled: true,
    theme: "dark",
    style: { fontSize: "11px", fontFamily: FONT },
    y: { formatter: (v: number) => `${v} visitors` },
  },
};

export const FootfallChart = () => (
  <Chart options={FOOTFALL_OPTIONS} series={FOOTFALL_SERIES} type="bar" height={70} />
);

/* ---------- Revenue trend ---------- */

const REVENUE_TREND_SERIES = [
  { name: "Revenue 2025", data: [72, 88, 61, 75, 58, 70, 79, 65, 84, 73, 90, 78] },
  { name: "Revenue 2026", data: [55, 70, 45, 60, 42, 55, 65, 50, 70, 58, 76, 62] },
];

const REVENUE_TREND_OPTIONS: ApexOptions = {
  chart: {
    type: "bar",
    height: 200,
    background: "transparent",
    toolbar: { show: false },
    animations: { enabled: false },
    parentHeightOffset: 0,
    offsetX: 0,
    offsetY: 0,
  },
  colors: ["#3A3A42", "#D4AF37"],
  // Prior year stays flat grey; the current year gets the gold gradient.
  fill: {
    type: ["solid", "gradient"],
    gradient: {
      shade: "dark",
      type: "vertical",
      shadeIntensity: 0.5,
      gradientToColors: ["#D4AF37", "#B8860B"],
      stops: [0, 100],
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "72%",
      borderRadius: 4,
      borderRadiusApplication: "end",
    },
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { show: false, padding: { top: 0, right: 0, bottom: 0, left: -10 } },
  xaxis: {
    categories: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    labels: { style: { colors: "#6B7280", fontSize: "10px", fontFamily: FONT } },
    axisBorder: { show: false },
    axisTicks: { show: false },
    crosshairs: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  tooltip: {
    enabled: true,
    theme: "dark",
    style: { fontSize: "11px", fontFamily: FONT },
    y: { formatter: (v: number) => `$${v}K` },
  },
};

export const RevenueTrendChart = () => (
  <Chart
    options={REVENUE_TREND_OPTIONS}
    series={REVENUE_TREND_SERIES}
    type="bar"
    height={200}
  />
);

/* ---------- Attendance heatmap ---------- */

const HEATMAP_WEEKS = 12;

/*
   Plain markup, not a charting library — the template builds these cells by
   hand and styles them with .heat-0 … .heat-4. The level is a fixed pattern
   rather than random so the grid looks identical on every load.
*/
const HEATMAP_CELLS = Array.from({ length: HEATMAP_WEEKS }, (_, w) =>
  DAYS.map((day, d) => ({
    key: `${w}-${d}`,
    level: (w * 7 + d * 3 + (w % 4)) % 5,
    title: `Week ${w + 1}, ${day}`,
  })),
).flat();

export const Heatmap = () => (
  <div className="flex gap-1.5 flex-wrap" id="heatmap">
    {HEATMAP_CELLS.map(({ key, level, title }) => (
      <div key={key} className={`heat-cell heat-${level}`} title={title} />
    ))}
  </div>
);

/* ---------- Renewal dot rows ---------- */

const DOT_TOTAL = 20;

const dots = (filled: number) =>
  Array.from({ length: DOT_TOTAL }, (_, i) => i < filled);

const TODAY_DOTS = dots(Math.round(DOT_TOTAL * 0.8)); // 16 of 20, gold
const YESTERDAY_DOTS = dots(Math.round(DOT_TOTAL * 0.4)); // 8 of 20, grey

const DotRow = ({ dots: row, id }: { dots: boolean[]; id: string }) => (
  <div className="dot-chart-row" id={id}>
    {row.map((isFilled, i) => (
      <span key={i} className={isFilled ? "dot dot-filled" : "dot"} />
    ))}
  </div>
);

export const RenewalsToday = () => <DotRow dots={TODAY_DOTS} id="renewals-today" />;

export const RenewalsYesterday = () => (
  <DotRow dots={YESTERDAY_DOTS} id="renewals-yesterday" />
);
