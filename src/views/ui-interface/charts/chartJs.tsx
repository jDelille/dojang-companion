import { useEffect, useRef, type ReactNode } from "react";
import { Chart, type ChartConfiguration } from "chart.js/auto";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/*
   Ported from tailwind/src/chart-js.html + assets/js/chart-js.js.

   Chart.js draws to a canvas rather than to the DOM, so each chart is mounted in
   an effect and destroyed on cleanup — no state is set in the effect body. The
   configs are built by module-level factories that take the theme's resolved
   grid/label colours, exactly as the template reads them from the root element.
*/

const GOLD = "#D4AF37";
const GOLD_SOFT = "#EAD79A";
const GOLD_DEEP = "#B8930F";
const GREEN = "#4ADE80";
const ORANGE = "#FB923C";
const BLUE = "#51A2FF";
const GRAY = "#99A1AF";

const MONTHS_6 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const MONTHS_12 = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_5 = ["Jan", "Feb", "Mar", "Apr", "May"];
const PIE_COLORS = [GOLD, GREEN, ORANGE, "#F6339A", BLUE];

type Theme = { border: string; label: string };

/**
 * Builds a chart config from the resolved theme colours. `canvas` is passed so
 * the gradient bar chart can create its linear gradient against a live context.
 */
type ConfigFactory = (
  theme: Theme,
  canvas: HTMLCanvasElement,
) => ChartConfiguration;

const barChart1: ConfigFactory = ({ border, label }) => ({
  type: "bar",
  data: {
    labels: MONTHS_6,
    datasets: [
      { label: "Sales", data: [40, 50, 70, 50, 40, 60], backgroundColor: GOLD, borderRadius: 10 },
    ],
  },
  options: {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: border },
        border: { color: border },
        ticks: { color: label, font: { size: 11 } },
      },
      y: {
        grid: { color: border },
        beginAtZero: true,
        max: 80,
        ticks: { color: label, font: { size: 10 } },
      },
    },
  },
});

const barChart2: ConfigFactory = ({ border, label }) => ({
  type: "bar",
  data: {
    labels: MONTHS_6,
    datasets: [
      {
        label: "Sales",
        data: [14, 12, 34, 25, 24, 20],
        backgroundColor: GOLD_SOFT,
        borderRadius: 10,
        barPercentage: 0.6,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: border },
        border: { color: border },
        ticks: { color: label, font: { size: 11 } },
      },
      y: {
        grid: { color: border },
        beginAtZero: true,
        max: 80,
        ticks: { color: label, font: { size: 10 } },
      },
    },
  },
});

const barChart3: ConfigFactory = ({ border, label }, canvas) => {
  const context = canvas.getContext("2d");
  let fill: CanvasGradient | string = GOLD_DEEP;
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, GOLD_DEEP);
    gradient.addColorStop(1, GOLD_SOFT);
    fill = gradient;
  }

  return {
    type: "bar",
    data: {
      labels: MONTHS_6,
      datasets: [{ label: "Sales", data: [14, 12, 34, 25, 24, 20], backgroundColor: fill }],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: label, font: { size: 11 } },
        },
        y: {
          grid: { color: border },
          border: { color: border },
          beginAtZero: true,
          max: 80,
          ticks: { color: label, font: { size: 10 } },
        },
      },
    },
  };
};

const barChart4: ConfigFactory = ({ border, label }) => ({
  type: "bar",
  data: {
    labels: MONTHS_6,
    datasets: [
      {
        label: "Sales",
        data: [14, 12, 34, 25, 24, 20],
        borderColor: GOLD,
        borderWidth: 2,
        backgroundColor: GOLD_SOFT,
      },
    ],
  },
  options: {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: border },
        border: { color: border, width: 1 },
        beginAtZero: true,
        ticks: { color: label, font: { size: 11 } },
      },
      y: {
        grid: { color: border },
        beginAtZero: true,
        max: 80,
        ticks: { color: label, font: { size: 10 } },
      },
    },
  },
});

const barChart5: ConfigFactory = ({ border, label }) => ({
  type: "bar",
  data: {
    labels: MONTHS_5,
    datasets: [
      { label: "Income", data: [14, 12, 34, 25, 24, 20], backgroundColor: GRAY },
      { label: "Expense", data: [22, 30, 25, 30, 20, 40], backgroundColor: GOLD },
    ],
  },
  options: {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        grid: { color: border },
        border: { color: border, width: 1 },
        beginAtZero: true,
        ticks: { color: label, font: { size: 11 } },
      },
      x: {
        grid: { color: border },
        border: { color: border, width: 1 },
        beginAtZero: true,
        max: 80,
        ticks: { color: label, font: { size: 11 } },
      },
    },
  },
});

const stackedChart1: ConfigFactory = ({ border, label }) => ({
  type: "bar",
  data: {
    labels: MONTHS_6,
    datasets: [
      {
        label: "Income",
        data: [14, 12, 34, 25, 24, 20],
        backgroundColor: GOLD,
        borderWidth: 1,
        fill: true,
      },
      {
        label: "Expense",
        data: [14, 12, 34, 25, 24, 20],
        backgroundColor: ORANGE,
        borderWidth: 1,
        fill: true,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: border },
        border: { color: border, width: 1 },
        stacked: true,
        beginAtZero: true,
        ticks: { color: label, font: { size: 11 } },
      },
      x: {
        grid: { color: border },
        border: { color: border, width: 1 },
        stacked: true,
        ticks: { color: label, font: { size: 11 } },
      },
    },
  },
});

const stackedChart2: ConfigFactory = ({ border, label }) => ({
  type: "bar",
  data: {
    labels: MONTHS_6,
    datasets: [
      {
        label: "Sales",
        data: [14, 12, 34, 25, 24, 20],
        backgroundColor: GREEN,
        borderWidth: 1,
        fill: true,
      },
      {
        label: "Revenue",
        data: [14, 12, 34, 25, 24, 20],
        backgroundColor: BLUE,
        borderWidth: 1,
        fill: true,
      },
    ],
  },
  options: {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        grid: { color: border },
        border: { color: border, width: 1 },
        stacked: true,
        beginAtZero: true,
        max: 80,
        ticks: { color: label, font: { size: 10 } },
      },
      x: {
        grid: { color: border },
        border: { color: border, width: 1 },
        stacked: true,
        beginAtZero: true,
        ticks: { color: label, font: { size: 11 } },
      },
    },
  },
});

const lineChart1: ConfigFactory = ({ border, label }) => ({
  type: "line",
  data: {
    labels: MONTHS_12,
    datasets: [
      {
        label: "Sales",
        data: [14, 12, 34, 25, 44, 36, 35, 25, 30, 32, 20, 25],
        borderColor: GOLD,
        borderWidth: 1,
        fill: false,
      },
      {
        label: "Revenue",
        data: [35, 30, 45, 35, 55, 40, 10, 20, 25, 55, 50, 45],
        borderColor: ORANGE,
        borderWidth: 1,
        fill: false,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: border },
        border: { color: border, width: 1 },
        ticks: { color: label },
      },
      y: {
        grid: { color: border },
        border: { color: border, width: 1 },
        beginAtZero: true,
        max: 80,
        ticks: { color: label, font: { size: 12 } },
      },
    },
  },
});

const scatterChart: ConfigFactory = ({ border, label }) => ({
  type: "scatter",
  data: {
    datasets: [
      {
        label: "Appointment",
        data: [
          { x: 10, y: 0 },
          { x: 0, y: 5 },
          { x: 15, y: 10 },
          { x: 4, y: 5 },
        ],
        backgroundColor: GOLD,
      },
      {
        label: "Completed",
        data: [
          { x: 10, y: 10 },
          { x: 0, y: 10 },
          { x: 15, y: 15 },
          { x: 4, y: 10 },
        ],
        backgroundColor: GREEN,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      x: {
        grid: { color: border },
        border: { color: border, width: 1 },
        ticks: { color: label },
        type: "linear",
        position: "bottom",
      },
      y: {
        grid: { color: border },
        border: { color: border, width: 1 },
        ticks: { color: label },
      },
    },
  },
});

const areaLineChart: ConfigFactory = ({ border, label }) => ({
  type: "line",
  data: {
    labels: MONTHS_12,
    datasets: [
      {
        label: "Income",
        data: [14, 12, 34, 25, 44, 36, 35, 25, 30, 32, 20, 25],
        borderColor: GOLD,
        backgroundColor: "rgba(212, 175, 55, 0.3)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Expense",
        data: [35, 30, 45, 35, 55, 40, 10, 20, 25, 65, 50, 45],
        borderColor: ORANGE,
        backgroundColor: "rgba(251, 146, 60, 0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "top" } },
    scales: {
      x: {
        grid: { color: border },
        border: { color: border, width: 1 },
        ticks: { color: label },
      },
      y: {
        grid: { color: border },
        border: { color: border, width: 1 },
        ticks: { color: label },
        beginAtZero: true,
      },
    },
  },
});

const PIE_DATA = {
  labels: MONTHS_5,
  datasets: [{ data: [35, 20, 8, 15, 24], backgroundColor: PIE_COLORS, borderWidth: 2 }],
};

/*
   `animateScale` / `animateRotate` live on the doughnut/pie AnimationSpec, so
   these two factories are declared against the narrowed config type rather than
   the shared `ChartConfiguration` union.
*/
const donutChart: ConfigFactory = (): ChartConfiguration<"doughnut"> => ({
  type: "doughnut",
  data: PIE_DATA,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { display: true, position: "top", labels: { boxWidth: 30, padding: 15 } },
    },
    animation: { animateScale: true, animateRotate: true },
  },
});

const pieChart: ConfigFactory = (): ChartConfiguration<"pie"> => ({
  type: "pie",
  data: PIE_DATA,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "bottom" } },
    animation: { animateScale: true, animateRotate: true },
  },
});

const readTheme = (): Theme => {
  const style = getComputedStyle(document.documentElement);
  return {
    border: style.getPropertyValue("--border").trim(),
    label: style.getPropertyValue("--dim").trim(),
  };
};

const ChartCanvas = ({ id, config }: { id: string; config: ConfigFactory }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, config(readTheme(), canvas));
    return () => chart.destroy();
  }, [config]);

  return <canvas id={id} ref={canvasRef} />;
};

const PreviewCard = ({
  title,
  children,
  code,
}: {
  title: string;
  children: ReactNode;
  code: string;
}) => (
  <PreviewCodeToggle
    title={title}
    code={code}
    cardShellClassName="preview-card glass-card p-5"
    contentClassName="h-75"
  >
    {children}
  </PreviewCodeToggle>
);

const CHART_CARDS: { title: string; id: string; type: string; config: ConfigFactory }[] = [
  { title: "Bar Chart", id: "chartBar1", type: "bar", config: barChart1 },
  { title: "Transparency", id: "chartBar2", type: "bar", config: barChart2 },
  { title: "Gradient Bar Chart", id: "chartBar3", type: "bar", config: barChart3 },
  { title: "Horizontal Bar Chart", id: "chartBar4", type: "bar", config: barChart4 },
  { title: "Horizontal Bar Chart Style2", id: "chartBar5", type: "bar", config: barChart5 },
  { title: "Vertical Stacked Bar Chart", id: "chartStacked1", type: "bar", config: stackedChart1 },
  { title: "Horizontal Stacked Bar Chart", id: "chartStacked2", type: "bar", config: stackedChart2 },
  { title: "Line Chart", id: "chartLine1", type: "line", config: lineChart1 },
  { title: "Donut Chart", id: "chartPie", type: "doughnut", config: donutChart },
  { title: "Pie Chart", id: "chartDonut", type: "pie", config: pieChart },
  { title: "Scatter Chart", id: "chartRadar", type: "scatter", config: scatterChart },
  { title: "Area Line Chart", id: "chartLine", type: "line", config: areaLineChart },
];

const chartCode = (id: string, type: string) =>
  `<canvas id="${id}"></canvas>
<script>
	new Chart(document.getElementById("${id}"), { type: "${type}", data: { /* ... */ }, options: { /* ... */ } });
</script>`;

const ChartJs = () => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
      <h1 className="text-xl font-black c-text mb-0">Chart JS</h1>
    </div>

    {/* Start grid */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {CHART_CARDS.map((card) => (
        <PreviewCard key={card.id} title={card.title} code={chartCode(card.id, card.type)}>
          <ChartCanvas id={card.id} config={card.config} />
        </PreviewCard>
      ))}
    </div>
    {/* End grid */}
  </div>
);

export default ChartJs;
