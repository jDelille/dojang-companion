import { type ReactNode } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/*
   Ported from tailwind/src/chart-apex.html + assets/js/chart-apex.js.

   Every options object and series is module-level: they never change, so
   building them once keeps ApexCharts from diffing a new object each render.
   Colours, grid padding and label styles are the template's CSS variables,
   which resolve against the active theme.
*/

const BORDER = "var(--border)";
const DIM = "var(--dim)";
const TITLE = "var(--color-title)";

/* ---------- Simple Line ---------- */

const S_LINE_SERIES = [
  { name: "Desktops", data: [10, 41, 35, 51, 49, 62, 69, 91, 148] },
];

const S_LINE_OPTIONS: ApexOptions = {
  chart: {
    height: 350,
    type: "line",
    zoom: { enabled: false },
    toolbar: { show: false },
  },
  colors: ["var(--color-primary)"],
  dataLabels: { enabled: false },
  stroke: { curve: "straight", width: 2 },
  title: {
    text: "Product Trends by Month",
    align: "left",
    style: { color: TITLE },
  },
  grid: {
    borderColor: BORDER,
    row: { opacity: 0.5 },
    padding: { left: -5, right: 0 },
  },
  xaxis: {
    labels: { style: { colors: DIM } },
    axisBorder: { color: BORDER },
    axisTicks: { color: BORDER },
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  },
  yaxis: {
    labels: { offsetX: -15, style: { colors: DIM } },
  },
};

/* ---------- Simple Line Area ---------- */

const S_LINE_AREA_SERIES = [
  { name: "Income", data: [40, 56, 28, 50, 42, 50, 60] },
  { name: "Expense", data: [20, 36, 20, 40, 25, 40, 30] },
];

const S_LINE_AREA_OPTIONS: ApexOptions = {
  chart: { height: 350, type: "area", toolbar: { show: false } },
  colors: ["var(--color-primary)", "var(--color-warning)"],
  dataLabels: { enabled: false },
  stroke: { curve: "straight", width: 1 },
  grid: {
    borderColor: BORDER,
    padding: { left: -5, right: -15 },
  },
  xaxis: {
    labels: { style: { colors: DIM } },
    axisBorder: { color: BORDER },
    axisTicks: { color: BORDER },
    type: "datetime",
    categories: [
      "2018-09-19T00:00:00",
      "2018-09-19T01:30:00",
      "2018-09-19T02:30:00",
      "2018-09-19T03:30:00",
      "2018-09-19T04:30:00",
      "2018-09-19T05:30:00",
      "2018-09-19T05:35:00",
    ],
  },
  tooltip: { x: { format: "dd/MM/yy HH:mm" } },
  yaxis: {
    min: 0,
    max: 60,
    labels: { offsetX: -15, style: { colors: DIM } },
  },
  legend: { labels: { colors: DIM } },
};

/* ---------- Simple Column ---------- */

const S_COL_SERIES = [
  { name: "Inprogress", data: [19, 65, 19, 19, 19, 19, 19] },
  { name: "Active", data: [89, 45, 89, 46, 61, 25, 79] },
  { name: "Completed", data: [39, 39, 39, 80, 48, 48, 48] },
];

const S_COL_OPTIONS: ApexOptions = {
  chart: { height: 290, type: "bar", toolbar: { show: false } },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "50%",
      borderRadius: 5,
    },
  },
  colors: [
    "var(--color-primary-500)",
    "var(--color-success-500)",
    "var(--color-warning-500)",
  ],
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ["transparent"] },
  xaxis: {
    categories: ["15 Jan", "16 Jan", "17 Jan", "18 Jan", "19 Jan", "20 Jan", "21 Jan"],
    labels: { style: { colors: DIM, fontSize: "12px" } },
    axisBorder: { color: BORDER },
    axisTicks: { color: BORDER },
  },
  yaxis: {
    labels: { offsetX: -15, style: { colors: DIM, fontSize: "14px" } },
  },
  grid: {
    borderColor: BORDER,
    strokeDashArray: 5,
    padding: { left: -8, right: -15 },
  },
  fill: { opacity: 1 },
  tooltip: {
    y: { formatter: (val: number) => `${val}%` },
  },
  legend: { labels: { colors: DIM } },
};

/* ---------- Simple Column Stacked ---------- */

const S_COL_STACKED_SERIES = [
  { name: "Laptops", data: [44, 55, 41, 67, 22, 43] },
  { name: "Cosmetics", data: [13, 23, 20, 8, 13, 27] },
  { name: "Medical Devices", data: [11, 17, 15, 15, 21, 14] },
  { name: "Software", data: [21, 7, 25, 13, 22, 8] },
];

const S_COL_STACKED_OPTIONS: ApexOptions = {
  chart: { height: 290, type: "bar", stacked: true, toolbar: { show: false } },
  responsive: [
    {
      breakpoint: 480,
      options: { legend: { position: "bottom", offsetX: -10, offsetY: 0 } },
    },
  ],
  plotOptions: { bar: { horizontal: false } },
  grid: {
    borderColor: BORDER,
    padding: { left: -5, right: -15 },
  },
  colors: [
    "var(--color-primary-500)",
    "var(--color-success-500)",
    "var(--color-warning-500)",
    "var(--color-info-600)",
  ],
  yaxis: {
    labels: { offsetX: -15, style: { colors: DIM } },
  },
  xaxis: {
    labels: { style: { colors: DIM } },
    axisBorder: { color: BORDER },
    axisTicks: { color: BORDER },
    type: "datetime",
    categories: [
      "01/01/2011 GMT",
      "01/02/2011 GMT",
      "01/03/2011 GMT",
      "01/04/2011 GMT",
      "01/05/2011 GMT",
      "01/06/2011 GMT",
    ],
  },
  legend: { labels: { colors: DIM } },
  fill: { opacity: 1 },
};

/* ---------- Simple Bar ---------- */

const S_BAR_SERIES = [{ data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380] }];

const S_BAR_OPTIONS: ApexOptions = {
  chart: { height: 350, type: "bar", toolbar: { show: false } },
  colors: ["var(--color-primary-600)"],
  grid: {
    borderColor: BORDER,
    padding: { left: 0, right: -15 },
  },
  plotOptions: { bar: { horizontal: true } },
  dataLabels: { enabled: false },
  xaxis: {
    labels: { style: { colors: DIM } },
    axisBorder: { color: BORDER },
    axisTicks: { color: BORDER },
    categories: [
      "South Korea",
      "Canada",
      "United Kingdom",
      "Netherlands",
      "Italy",
      "France",
      "Japan",
      "United States",
      "China",
      "Germany",
    ],
  },
  yaxis: {
    labels: { offsetX: -10, style: { colors: DIM } },
  },
};

/* ---------- Mixed Chart ---------- */

const MIXED_SERIES = [
  {
    name: "Website Blog",
    type: "column",
    data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160],
  },
  {
    name: "Social Media",
    type: "line",
    data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16],
  },
];

const MIXED_OPTIONS: ApexOptions = {
  chart: { height: 350, type: "line", toolbar: { show: false } },
  colors: ["var(--color-primary-600)", "var(--color-success-600)"],
  stroke: { width: [0, 4] },
  grid: {
    borderColor: BORDER,
    padding: { left: -5, right: -15 },
  },
  title: {
    text: "Traffic Sources",
    style: { color: TITLE },
  },
  legend: { labels: { colors: DIM } },
  labels: [
    "01 Jan 2001",
    "02 Jan 2001",
    "03 Jan 2001",
    "04 Jan 2001",
    "05 Jan 2001",
    "06 Jan 2001",
    "07 Jan 2001",
    "08 Jan 2001",
    "09 Jan 2001",
    "10 Jan 2001",
    "11 Jan 2001",
    "12 Jan 2001",
  ],
  xaxis: {
    type: "datetime",
    labels: { style: { colors: DIM } },
    axisBorder: { color: BORDER },
    axisTicks: { color: BORDER },
  },
  yaxis: [
    {
      title: { text: "Website Blog" },
      labels: { offsetX: -15, style: { colors: DIM } },
    },
    {
      opposite: true,
      title: { text: "Social Media" },
      labels: { offsetX: -15, style: { colors: DIM } },
    },
  ],
};

/* ---------- Donut Chart ---------- */

const DONUT_SERIES = [44, 55, 41, 17];

const DONUT_OPTIONS: ApexOptions = {
  chart: { height: 330, type: "donut", toolbar: { show: false } },
  legend: {
    position: "bottom",
    labels: { colors: DIM },
  },
  colors: [
    "var(--color-primary-600)",
    "var(--color-success-600)",
    "var(--color-warning-600)",
    "var(--color-info-600)",
  ],
  labels: ["Laptops", "Cosmetics", "Medical Devices", "Software"],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: "bottom" },
      },
    },
  ],
};

/* ---------- Radial Chart ---------- */

const RADIAL_SERIES = [44, 55, 67, 83];

const RADIAL_OPTIONS: ApexOptions = {
  chart: { height: 350, type: "radialBar", toolbar: { show: false } },
  colors: [
    "var(--color-primary-600)",
    "var(--color-success-600)",
    "var(--color-warning-600)",
    "var(--color-info-600)",
  ],
  plotOptions: {
    radialBar: {
      dataLabels: {
        name: { fontSize: "22px", color: TITLE },
        value: { fontSize: "16px", color: DIM },
        total: {
          show: true,
          label: "Total",
          color: DIM,
          formatter: () => "249",
        },
      },
    },
  },
  labels: ["Apples", "Oranges", "Bananas", "Berries"],
};

const PreviewCard = ({
  title,
  children,
  cardClassName = "pb-0",
  code,
}: {
  title: string;
  children: ReactNode;
  cardClassName?: string;
  code: string;
}) => (
  <PreviewCodeToggle
    title={title}
    code={code}
    cardShellClassName={`preview-card glass-card p-5 ${cardClassName}`}
    contentClassName="chart-set"
  >
    {children}
  </PreviewCodeToggle>
);

const ChartApex = () => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
      <h1 className="text-xl font-black c-text mb-0">Chart Apex</h1>
    </div>

    {/* Start grid */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <PreviewCard
        title="Apex Simple"
        code={`<div id="chart-line" class="chart-set"></div>
<script>
	new ApexCharts(document.querySelector("#chart-line"), {
		chart: { height: 350, type: "line", toolbar: { show: false } },
		series: [{ name: "Desktops", data: [10, 41, 35, 51, 49, 62, 69, 91, 148] }],
		title: { text: "Product Trends by Month", align: "left" },
		xaxis: { categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"] }
	}).render();
</script>`}
      >
        <Chart options={S_LINE_OPTIONS} series={S_LINE_SERIES} type="line" height={350} />
      </PreviewCard>

      <PreviewCard
        title="Area Chart"
        code={`<div id="chart-area" class="chart-set"></div>
<script>
	new ApexCharts(document.querySelector("#chart-area"), {
		chart: { height: 350, type: "area", toolbar: { show: false } },
		series: [
			{ name: "Income", data: [40, 56, 28, 50, 42, 50, 60] },
			{ name: "Expense", data: [20, 36, 20, 40, 25, 40, 30] }
		],
		xaxis: { type: "datetime" }
	}).render();
</script>`}
      >
        <Chart
          options={S_LINE_AREA_OPTIONS}
          series={S_LINE_AREA_SERIES}
          type="area"
          height={350}
        />
      </PreviewCard>

      <PreviewCard
        title="Column Chart"
        code={`<div id="chart-column" class="chart-set"></div>
<script>
	new ApexCharts(document.querySelector("#chart-column"), {
		chart: { height: 290, type: "bar", toolbar: { show: false } },
		plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 5 } },
		series: [
			{ name: "Inprogress", data: [19, 65, 19, 19, 19, 19, 19] },
			{ name: "Active", data: [89, 45, 89, 46, 61, 25, 79] },
			{ name: "Completed", data: [39, 39, 39, 80, 48, 48, 48] }
		],
		xaxis: { categories: ["15 Jan","16 Jan","17 Jan","18 Jan","19 Jan","20 Jan","21 Jan"] }
	}).render();
</script>`}
      >
        <Chart options={S_COL_OPTIONS} series={S_COL_SERIES} type="bar" height={290} />
      </PreviewCard>

      <PreviewCard
        title="Column Stacked Chart"
        code={`<div id="chart-column-stacked" class="chart-set"></div>
<script>
	new ApexCharts(document.querySelector("#chart-column-stacked"), {
		chart: { height: 290, type: "bar", stacked: true, toolbar: { show: false } },
		plotOptions: { bar: { horizontal: false } },
		series: [
			{ name: "Laptops", data: [44, 55, 41, 67, 22, 43] },
			{ name: "Cosmetics", data: [13, 23, 20, 8, 13, 27] },
			{ name: "Medical Devices", data: [11, 17, 15, 15, 21, 14] },
			{ name: "Software", data: [21, 7, 25, 13, 22, 8] }
		],
		xaxis: { type: "datetime" }
	}).render();
</script>`}
      >
        <Chart
          options={S_COL_STACKED_OPTIONS}
          series={S_COL_STACKED_SERIES}
          type="bar"
          height={290}
        />
      </PreviewCard>

      <PreviewCard
        title="Bar Chart"
        code={`<div id="chart-bar" class="chart-set"></div>
<script>
	new ApexCharts(document.querySelector("#chart-bar"), {
		chart: { height: 350, type: "bar", toolbar: { show: false } },
		plotOptions: { bar: { horizontal: true } },
		series: [{ data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380] }],
		xaxis: { categories: ["South Korea","Canada","United Kingdom","Netherlands","Italy","France","Japan","United States","China","Germany"] }
	}).render();
</script>`}
      >
        <Chart options={S_BAR_OPTIONS} series={S_BAR_SERIES} type="bar" height={350} />
      </PreviewCard>

      <PreviewCard
        title="Mixed Chart"
        code={`<div id="chart-mixed" class="chart-set"></div>
<script>
	new ApexCharts(document.querySelector("#chart-mixed"), {
		chart: { height: 350, type: "line", toolbar: { show: false } },
		stroke: { width: [0, 4] },
		title: { text: "Traffic Sources" },
		series: [
			{ name: "Website Blog", type: "column", data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160] },
			{ name: "Social Media", type: "line", data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16] }
		]
	}).render();
</script>`}
      >
        <Chart options={MIXED_OPTIONS} series={MIXED_SERIES} type="line" height={350} />
      </PreviewCard>

      <PreviewCard
        title="Donut Chart"
        cardClassName=""
        code={`<div id="chart-donut" class="chart-set"></div>
<script>
	new ApexCharts(document.querySelector("#chart-donut"), {
		chart: { height: 330, type: "donut", toolbar: { show: false } },
		series: [44, 55, 41, 17],
		labels: ["Laptops", "Cosmetics", "Medical Devices", "Software"],
		legend: { position: "bottom" }
	}).render();
</script>`}
      >
        <Chart options={DONUT_OPTIONS} series={DONUT_SERIES} type="donut" height={330} />
      </PreviewCard>

      <PreviewCard
        title="Radial Chart"
        code={`<div id="chart-radial" class="chart-set"></div>
<script>
	new ApexCharts(document.querySelector("#chart-radial"), {
		chart: { height: 350, type: "radialBar", toolbar: { show: false } },
		series: [44, 55, 67, 83],
		labels: ["Apples", "Oranges", "Bananas", "Berries"]
	}).render();
</script>`}
      >
        <Chart options={RADIAL_OPTIONS} series={RADIAL_SERIES} type="radialBar" height={350} />
      </PreviewCard>
    </div>
    {/* End grid */}
  </div>
);

export default ChartApex;
