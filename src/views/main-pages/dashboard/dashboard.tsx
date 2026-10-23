
import {
  ArrowUpRight,
  Banknote,
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  CreditCard,
  Download,
  Dumbbell,
  FileText,
  IndianRupee,
  LayoutDashboard,
  RefreshCw,
  ScanLine,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  TicketPercent,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { all_routes } from "../../../routes/all_routes"
import useCounter from "../../../hooks/useCounter"
import useToast from "../../../hooks/useToast"
import Toast from "../../../components/common/Toast"
import SegmentedButtons from "../../../components/common/SegmentedButtons"
import ExportReportModal from "./exportReportModal"
import {
  FootfallChart,
  Heatmap,
  PtBars,
  RenewalsToday,
  RenewalsYesterday,
  RevenueSparkline,
  RevenueTrendChart,
} from "./charts/mainDashboardCharts"
import ImageWithBasePath from "../../../components/image-with-base-path"
import Link from "next/link"


const Dashboard = () => {
  const activeMembers = useCounter(1842);
  const totalRevenue = useCounter(104000, "$");
  const checkIns = useCounter(312);
  const supplementSales = useCounter(5880, "$");
  const ptSessions = useCounter(26);

  const { message, visible, showToast } = useToast();
  const [exportOpen, setExportOpen] = useState(false);

  return (
 <>
  <div id="section-dashboard" className="section active-section">
    {/* Page header */}
    <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
      <div className="flex items-center gap-3">
        <div className="dash-badge">
          <LayoutDashboard className="w-5 h-5 t-ink" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-black c-text leading-none">
            Dashboard Overview
          </h1>
          <p className="text-xs mt-1.5 flex items-center gap-2 c-dim flex-wrap">
            <Calendar className="w-3 h-3" aria-hidden="true" />
            Tuesday, July 14, 2026 · Austin HQ
            <span className="inline-flex items-center gap-1.5 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="c-ok">All systems operational</span>
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedButtons
          label="Timeframe"
          options={["Today", "Week", "Month"]}
          className="sm:flex items-center gap-1 p-1 rounded-xl seg-wrap"
          buttonClassName="text-[11px]! py-1.5! px-3!"
          onSelect={showToast}
        />
        <button
          type="button"
          className="btn-ghost flex items-center gap-2 px-3.5 py-2.5 text-sm"
          onClick={() => setExportOpen(true)}
        >
          <Download className="w-[14px] h-[14px]" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <Link
          href={all_routes.pos}
          className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <ShoppingCart className="w-[14px] h-[14px]" aria-hidden="true" />
          Open POS
        </Link>
      </div>
    </div>
    {/* ═══ KPI cards ═══ */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mb-2">
      {/* 1 · Active Members */}
      <div className="kpi kpi-glow reveal lg:col-span-3 gap-4 relative overflow-hidden">
        <div className="flex lg:col-span-3 flex-row! justify-start! items-center gap-4">
          <div className="relative shrink-0 kpi-dial">
            <svg viewBox="0 0 100 100" className="w-full h-full ring-rot">
              <circle
                cx={50}
                cy={50}
                r={42}
                fill="none"
                stroke="rgba(212,175,55,0.08)"
                strokeWidth={9}
              />
              <circle
                cx={50}
                cy={50}
                r={42}
                fill="none"
                stroke="#D4AF37"
                strokeWidth={9}
                strokeDasharray={264}
                strokeDashoffset={58}
                strokeLinecap="round"
                className="ring-arc"
              />
            </svg>
            <div className="ring-val">
              <span className="text-sm font-black gt">78%</span>
            </div>
          </div>
          <div>
            <div
              className="text-[22px] font-black c-text leading-none counter"
            >
              {activeMembers}
            </div>
            <div className="text-xs mt-1 font-medium c-dim">Active Members</div>
            <div className="text-[11px] mt-1.5 trend-up font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
              +3.8% this week
            </div>
          </div>
        </div>
        <div className="mb-3 relative z-1">
          <div className="text-xs mb-2 font-medium c-dim">Men</div>
          <div className="text-[22px] font-black c-text leading-none counter">
            1400
          </div>
        </div>
        <div className="mb-0 relative z-1">
          <div className="text-xs mb-2 font-medium c-dim">Women</div>
          <div className="text-[22px] font-black c-text leading-none counter">
            442
          </div>
        </div>
        <ImageWithBasePath
          src="assets/img/dashboard/user-1.png"
          alt="user"
          className="absolute bottom-0 end-0 z-1"
        />
        <ImageWithBasePath
          src="assets/img/shadow/element-1.svg"
          alt="user"
          className="absolute bottom-0 end-0"
        />
      </div>
      {/* 2 · Total Revenue */}
      <div className="kpi kpi-featured reveal lg:col-span-6">
        <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
          <div className="w-full grow">
            <div className="flex items-center justify-start gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center grad-gold-lt shadow-gold-sm">
                  <IndianRupee className="w-[19px] h-[19px] t-ink" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[16px] font-bold c-text mb-1">
                    Total Revenue
                  </div>
                  <div className="text-[10px] c-dim">This month · Jul 2026</div>
                </div>
              </div>
              <span className="trend-pill tp-green">
                <TrendingUp className="w-3 h-3 c-green" aria-hidden="true" />
                <span className="trend-up">+18.2%</span>
              </span>
            </div>
            <div className="mb-3 mt-4">
              <div
                className="text-[32px] font-black c-text leading-none counter"
              >
                {totalRevenue}
              </div>
              <div className="text-[11px] mt-2 flex items-center gap-2 c-dim">
                vs last month <span className="font-bold c-text2">$88K</span>
              </div>
            </div>
            <div className="spark-64">
              <RevenueSparkline />
            </div>
          </div>
          <div className="flex items-center justify-center w-full">
            <ImageWithBasePath
              src="assets/img/dashboard/user-2.png"
              alt="user"
              className="max-w-[205px] hidden lg:block"
            />
          </div>
        </div>
      </div>
      {/* 3 · Today's Check-ins */}
      <div className="kpi reveal lg:col-span-3">
        <div className="flex items-center justify-between mb-3">
          <div className="icon-box w-9! h-9! ibox-orange">
            <ScanLine className="w-4 h-4 c-orange" aria-hidden="true" />
          </div>
          <span className="trend-pill tp-green">
            <span className="trend-up">+5.3%</span>
          </span>
        </div>
        <div
          className="text-[22px] font-black c-text leading-none counter"
        >
          {checkIns}
        </div>
        <div className="text-xs mt-1 font-medium c-dim">Today's Check-ins</div>
        <div className="flex items-center my-4 -space-x-2.5 ">
          <ImageWithBasePath
            src="assets/img/avatars/avatar-13.jpg"
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--c-dim)] relative z-[6]"
          />
          <ImageWithBasePath
            src="assets/img/avatars/avatar-14.jpg"
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--c-dim)] relative z-[5]"
          />
          <ImageWithBasePath
            src="assets/img/avatars/avatar-15.jpg"
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--c-dim)] relative z-[4]"
          />
          <ImageWithBasePath
            src="assets/img/avatars/avatar-16.jpg"
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--c-dim)] relative z-[3]"
          />
          <ImageWithBasePath
            src="assets/img/avatars/avatar-17.jpg"
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--c-dim)] relative z-[2]"
          />
          <ImageWithBasePath
            src="assets/img/avatars/avatar-18.jpg"
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--c-dim)] relative z-[1]"
          />
          <span className="w-10 h-10 rounded-full bg-[var(--c-border)] ring-1 ring-[var(--c-surface)] flex items-center justify-center text-[10px] font-semibold c-dim relative z-0">
            +8
          </span>
        </div>
        <div className="cmp-track mt-3">
          <div className="cmp-fill fill-orange instyle-8" />
        </div>
        <div className="flex justify-between text-[10px] mt-1.5 c-dim">
          <span>78% of target</span>
          <span>Goal 400</span>
        </div>
      </div>
      {/* 4 · Renewals */}
      <div className="kpi kpi-glow reveal lg:col-span-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="icon-box w-9! h-9! ibox-yellow">
              <RefreshCw className="w-4 h-4 c-yellow" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[22px] font-black c-text leading-none">
                52
              </div>
              <div className="text-[11px] c-dim">Renewals</div>
            </div>
          </div>
          <span className="trend-pill tp-green">
            <TrendingUp className="w-3 h-3 c-green" aria-hidden="true" />
            <span className="trend-up">+26.8%</span>
          </span>
        </div>
        <div className="space-y-2 mt-4">
          <div className="dot-row-wrap">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="c-text2">Today</span>
              <span className="font-bold c-yellow">52</span>
            </div>
            <RenewalsToday />
          </div>
          <div className="dot-row-wrap">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="c-dim">Yesterday</span>
              <span className="font-bold c-muted">41</span>
            </div>
            <RenewalsYesterday />
          </div>
        </div>
      </div>
      {/* 5 · Supplement Sales */}
      <div className="kpi reveal lg:col-span-4 flex-row! justify-start! items-stretch gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="w-full grow">
            <div className="flex items-center gap-4  ">
              <div className="size-14 rounded-xl flex flex-col items-center justify-center shrink-0 supp-panel">
                <ShoppingBag className="w-5 h-5 c-green" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-semibold c-muted">
                  Supplement Sales
                </div>
                <div
                  className="text-[22px] font-black c-text leading-none mt-1.5 counter"
                >
                  {supplementSales}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5 pt-5 bd-t">
              <div>
                <div className="text-sm font-black c-text">147</div>
                <div className="text-[10px] c-dim">Units Sold</div>
              </div>
              <div>
                <div className="text-sm font-black c-text">$40</div>
                <div className="text-[10px] c-dim">Avg. Order</div>
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <ImageWithBasePath
              src="assets/img/dashboard/product-1.png"
              alt="user"
              className="max-w-[205px] hidden lg:block"
            />
          </div>
        </div>
        <div className="size-40 bg-gold absolute m-auto top-0 bottom-0 right-0 translate-x-1/2 rounded-full" />
      </div>
      {/* 6 · PT Sessions */}
      <div className="kpi reveal lg:col-span-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="icon-box w-9! h-9! ibox-indigo">
              <Dumbbell className="w-4 h-4 c-indigo" aria-hidden="true" />
            </div>
            <div>
              <div
                className="text-[22px] font-black c-text leading-none counter"
              >
                {ptSessions}
              </div>
              <div className="text-[11px] c-dim">PT Sessions Today</div>
            </div>
          </div>
          <span className="trend-pill tp-green">
            <span className="trend-up">+11.4%</span>
          </span>
        </div>
        <div className="mt-3">
          <PtBars />
        </div>
      </div>
    </div>
    <div className="band-label">
      <span>Analytics &amp; Insights</span>
    </div>
    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* Membership Mix */}
      <div className="glass-card p-5">
        <h3 className="font-bold c-text">Membership Mix</h3>
        <p className="text-xs mt-0.5 mb-5 c-dim">Active plan distribution</p>
        <div className="flex flex-col gap-3.5">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium c-text2">Annual Premium</span>
              <span className="font-bold gt">42%</span>
            </div>
            <div className="prog-track">
              <div className="prog-bar instyle-11" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium c-text2">Monthly Standard</span>
              <span className="font-bold c-indigo">28%</span>
            </div>
            <div className="prog-track">
              <div className="prog-bar pb-indigo instyle-12" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium c-text2">Quarterly Gold</span>
              <span className="font-bold c-orange">18%</span>
            </div>
            <div className="prog-track">
              <div className="prog-bar pb-orange instyle-13" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium c-text2">Student Plan</span>
              <span className="font-bold c-cyan">12%</span>
            </div>
            <div className="prog-track">
              <div className="prog-bar pb-cyan instyle-14" />
            </div>
          </div>
        </div>
        <div className="mt-5 pt-4 grid grid-cols-2 gap-3 text-center bd-t">
          <div>
            <div className="text-xl font-black gt">1,842</div>
            <div className="text-[10px] mt-0.5 c-dim">Total Active</div>
          </div>
          <div>
            <div className="text-xl font-black c-text">$74.8K</div>
            <div className="text-[10px] mt-0.5 c-dim">MRR</div>
          </div>
        </div>
      </div>
      {/* Revenue Chart */}
      <div className="glass-card p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold c-text">Revenue Trend</h3>
            <p className="text-xs mt-0.5 c-dim">Jan–Jul 2026 · $618K total</p>
          </div>
          <SegmentedButtons
            label="Revenue range"
            options={["Monthly", "Weekly"]}
            className="flex gap-1.5"
            buttonClassName="text-xs! py-1.5! px-3!"
            onSelect={showToast}
          />
        </div>
        <div className="revenue-chart-wrap">
          <RevenueTrendChart />
        </div>
        <div className="flex items-center gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full dot-gold" />
            <span className="text-xs c-dim">Revenue 2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full dot-border" />
            <span className="text-xs c-dim">Revenue 2025</span>
          </div>
          <div className="ml-auto text-xs font-bold c-gold">
            ↑ 18.2% vs last year
          </div>
        </div>
      </div>
    </div>
    {/* Heatmap + Trainers */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold c-text">Attendance Heatmap</h3>
            <p className="text-xs mt-0.5 c-dim">Last 12 weeks · peak hours</p>
          </div>
          <span className="badge-active text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Live
          </span>
        </div>
        <Heatmap />
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] c-dim2">Low</span>
          <div className="heat-cell heat-0" />
          <div className="heat-cell heat-1" />
          <div className="heat-cell heat-2" />
          <div className="heat-cell heat-3" />
          <div className="heat-cell heat-4" />
          <span className="text-[10px] c-dim2">High</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 bd-t text-center">
          <div>
            <div className="text-lg font-black gt">6–8 PM</div>
            <div className="text-[10px] mt-0.5 c-dim">Peak Window</div>
          </div>
          <div>
            <div className="text-lg font-black c-text">Saturday</div>
            <div className="text-[10px] mt-0.5 c-dim">Busiest Day</div>
          </div>
          <div>
            <div className="text-lg font-black c-text">284</div>
            <div className="text-[10px] mt-0.5 c-dim">Avg / Day</div>
          </div>
        </div>
        <div className="mt-4 pt-4 bd-t">
          <div className="flex items-center justify-between mb-0">
            <span className="text-[11px] font-semibold c-text2">
              Hourly Footfall
            </span>
            <span className="text-[10px] c-dim">6 AM – 9 PM</span>
          </div>
          <FootfallChart />
          <div className="flex justify-between text-[9px] mt-1 c-dim2">
            <span>6a</span>
            <span>9a</span>
            <span>12p</span>
            <span>3p</span>
            <span>6p</span>
            <span>9p</span>
          </div>
        </div>
      </div>
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text">Top Trainers</h3>
          <Link href={all_routes.trainers} className="text-xs font-semibold c-gold">
            View All
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <Link
            href={all_routes.trainers}
            className="list-row flex items-center gap-3 p-3 row-gold"
          >
            <div className="relative">
              <div className="overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-gold">
                <ImageWithBasePath src="assets/img/avatars/avatar-01.jpg" alt="users" />
              </div>
              <div className="absolute -top-1 -right-1 text-[10px]">👑</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text">Daniel Foster</div>
              <div className="text-[11px] mt-0.5 c-dim">
                Strength &amp; Conditioning
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold gt">48</div>
              <div className="text-[10px] c-dim">sessions</div>
            </div>
          </Link>
          <Link
            href={all_routes.trainers}
            className="list-row flex items-center gap-3 p-3 row-indigo"
          >
            <div className="overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-gold">
              <ImageWithBasePath src="assets/img/avatars/avatar-02.jpg" alt="users" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text">Rachel Morgan</div>
              <div className="text-[11px] mt-0.5 c-dim">
                Yoga &amp; Flexibility
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold c-indigo">41</div>
              <div className="text-[10px] c-dim">sessions</div>
            </div>
          </Link>
          <Link
            href={all_routes.trainers}
            className="list-row flex items-center gap-3 p-3 row-orange"
          >
            <div className="overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-gold">
              <ImageWithBasePath src="assets/img/avatars/avatar-03.jpg" alt="users" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text">Andre Jackson</div>
              <div className="text-[11px] mt-0.5 c-dim">Cardio &amp; HIIT</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold c-orange">37</div>
              <div className="text-[10px] c-dim">sessions</div>
            </div>
          </Link>
          <Link
            href={all_routes.trainers}
            className="list-row flex items-center gap-3 p-3 row-cyan"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-cyan">
              LH
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text">Lauren Hayes</div>
              <div className="text-[11px] mt-0.5 c-dim">Zumba &amp; Dance</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold c-cyan">29</div>
              <div className="text-[10px] c-dim">sessions</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
    {/* Orders + Classes */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      <div className="glass-card p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text">Recent Orders</h3>
          <Link href={all_routes.orders} className="text-xs font-semibold c-gold">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Order</th>
                <th className="text-left">Member</th>
                <th className="text-left">Item</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Status</th>
                <th className="text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="font-bold text-xs gt">#4218</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="mini-avatar tint-gold-12">AB</div>
                    <span className="text-sm">Ashley Bennett</span>
                  </div>
                </td>
                <td className="text-xs c-dim">Whey Protein ×2</td>
                <td className="font-bold text-sm c-text">$109.98</td>
                <td>
                  <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                </td>
                <td className="text-xs c-dim">9:12 AM</td>
              </tr>
              <tr>
                <td>
                  <span className="font-bold text-xs gt">#4217</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="mini-avatar tint-indigo-10 c-indigo">
                      MC
                    </div>
                    <span className="text-sm">Marcus Coleman</span>
                  </div>
                </td>
                <td className="text-xs c-dim">Monthly Plan</td>
                <td className="font-bold text-sm c-text">$49.00</td>
                <td>
                  <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                </td>
                <td className="text-xs c-dim">8:54 AM</td>
              </tr>
              <tr>
                <td>
                  <span className="font-bold text-xs gt">#4216</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="mini-avatar tint-orange-10 c-orange">
                      JR
                    </div>
                    <span className="text-sm">Jessica Ramirez</span>
                  </div>
                </td>
                <td className="text-xs c-dim">PT Session ×3</td>
                <td className="font-bold text-sm c-text">$195.00</td>
                <td>
                  <span className="badge-pending text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </td>
                <td className="text-xs c-dim">8:33 AM</td>
              </tr>
              <tr>
                <td>
                  <span className="font-bold text-xs gt">#4215</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="mini-avatar tint-cyan-10 c-cyan">GW</div>
                    <span className="text-sm">Grant Whitfield</span>
                  </div>
                </td>
                <td className="text-xs c-dim">Energy Drink ×5</td>
                <td className="font-bold text-sm c-text">$19.95</td>
                <td>
                  <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                </td>
                <td className="text-xs c-dim">8:10 AM</td>
              </tr>
              <tr>
                <td>
                  <span className="font-bold text-xs gt">#4214</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="mini-avatar tint-red-10 c-red">BC</div>
                    <span className="text-sm">Brooke Carter</span>
                  </div>
                </td>
                <td className="text-xs c-dim">Annual Premium</td>
                <td className="font-bold text-sm c-text">$449.00</td>
                <td>
                  <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                </td>
                <td className="text-xs c-dim">7:48 AM</td>
              </tr>
              <tr>
                <td>
                  <span className="font-bold text-xs gt">#4213</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="mini-avatar tint-gold-12">TB</div>
                    <span className="text-sm">Tyler Brooks</span>
                  </div>
                </td>
                <td className="text-xs c-dim">Gym Gloves ×1</td>
                <td className="font-bold text-sm c-text">$24.99</td>
                <td>
                  <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                </td>
                <td className="text-xs c-dim">7:31 AM</td>
              </tr>
              <tr>
                <td>
                  <span className="font-bold text-xs gt">#4212</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="mini-avatar tint-indigo-10 c-indigo">
                      CN
                    </div>
                    <span className="text-sm">Chloe Nguyen</span>
                  </div>
                </td>
                <td className="text-xs c-dim">Quarterly Gold</td>
                <td className="font-bold text-sm c-text">$129.00</td>
                <td>
                  <span className="badge-pending text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </td>
                <td className="text-xs c-dim">7:15 AM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text">Today's Classes</h3>
          <span className="text-xs c-dim">Tue, Jul 14</span>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href={all_routes.classes}
            className="flex gap-3 p-3 rounded-xl cursor-pointer transition-all cls-gold"
          >
            <div className="text-center w-10 shrink-0">
              <div className="text-xs font-bold c-gold">6:00</div>
              <div className="text-[10px] c-dim2">AM</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text">Morning Yoga</div>
              <div className="text-[11px] mt-0.5 c-dim">Rachel · Hall A</div>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="miniprog mp-track-gold">
                  <div className="h-full rounded-full mp-gold instyle-15" />
                </div>
                <span className="text-[10px] c-dim">17/20</span>
              </div>
            </div>
          </Link>
          <Link
            href={all_routes.classes}
            className="flex gap-3 p-3 rounded-xl cursor-pointer transition-all cls-indigo"
          >
            <div className="text-center w-10 shrink-0">
              <div className="text-xs font-bold c-indigo">8:30</div>
              <div className="text-[10px] c-dim2">AM</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text">HIIT Blast</div>
              <div className="text-[11px] mt-0.5 c-dim">Andre · Studio B</div>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="miniprog mp-track-indigo">
                  <div className="h-full rounded-full mp-indigo instyle-16" />
                </div>
                <span className="text-[10px] c-dim">12/20</span>
              </div>
            </div>
          </Link>
          <Link
            href={all_routes.classes}
            className="flex gap-3 p-3 rounded-xl cursor-pointer transition-all cls-orange"
          >
            <div className="text-center w-10 shrink-0">
              <div className="text-xs font-bold c-orange">11:00</div>
              <div className="text-[10px] c-dim2">AM</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text">Zumba Dance</div>
              <div className="text-[11px] mt-0.5 c-dim">Ashley · Hall A</div>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="miniprog mp-track-orange">
                  <div className="h-full rounded-full mp-orange instyle-17" />
                </div>
                <span className="text-[10px] c-dim">8/25</span>
              </div>
            </div>
          </Link>
          <Link
            href={all_routes.classes}
            className="flex gap-3 p-3 rounded-xl cursor-pointer transition-all cls-cyan"
          >
            <div className="text-center w-10 shrink-0">
              <div className="text-xs font-bold c-cyan">6:00</div>
              <div className="text-[10px] c-dim2">PM</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text">Power Lifting</div>
              <div className="text-[11px] mt-0.5 c-dim">Daniel · Gym Floor</div>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="miniprog mp-track-cyan">
                  <div className="h-full rounded-full mp-cyan instyle-18" />
                </div>
                <span className="text-[10px] c-dim">6/15</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
    <div className="band-label">
      <span>Quick Access</span>
    </div>
    {/* Quick Actions + Best Sellers + Equipment */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="glass-card p-5">
        <h3 className="font-bold c-text mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href={all_routes.pos}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic tint-gold">
              <ShoppingCart className="w-[15px] h-[15px] c-gold" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">New Sale</span>
          </Link>
          <Link
            href={all_routes.members}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic tint-indigo-10">
              <UserPlus className="w-[15px] h-[15px] c-indigo" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">Add Member</span>
          </Link>
          <Link
            href={all_routes.checkin}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic tint-orange-10">
              <ScanLine className="w-[15px] h-[15px] c-orange" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">Check-In</span>
          </Link>
          <Link
            href={all_routes.invoices}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic tint-cyan-10">
              <FileText className="w-[15px] h-[15px] c-cyan" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">Invoice</span>
          </Link>
          <Link
            href={all_routes.reports}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic tint-red-10">
              <BarChart3 className="w-[15px] h-[15px] c-red" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">Reports</span>
          </Link>
          <Link
            href={all_routes.renewals}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic ibox-yellow">
              <RefreshCw className="w-[15px] h-[15px] c-yellow" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">Renew</span>
          </Link>
          <Link
            href={all_routes.classes}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic tint-indigo-10">
              <CalendarPlus className="w-[15px] h-[15px] c-indigo" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">Add Class</span>
          </Link>
          <Link
            href={all_routes.attendance}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic tint-cyan-10">
              <CalendarCheck className="w-[15px] h-[15px] c-cyan" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">Attendance</span>
          </Link>
          <Link
            href={all_routes.offers}
            className="btn-ghost flex flex-col items-center gap-2 p-3 rounded-xl text-center"
          >
            <div className="qa-ic tint-gold">
              <TicketPercent className="w-[15px] h-[15px] c-gold" aria-hidden="true" />
            </div>
            <span className="text-[11px] c-dim">Offers</span>
          </Link>
        </div>
      </div>
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text">Best Sellers</h3>
          <Link href={all_routes.products} className="text-xs font-semibold c-gold">
            See All
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 tile-soft-gold">
              🥛
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Whey Protein 2 lb
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                143 sold this month
              </div>
            </div>
            <div className="text-sm font-bold gt">$54.99</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 tile-soft-indigo">
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Pre-Workout BCAA
              </div>
              <div className="text-[11px] mt-0.5 c-dim">98 sold this month</div>
            </div>
            <div className="text-sm font-bold c-indigo">$34.99</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 tile-soft-orange">
              🧃
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Electrolyte Drink
              </div>
              <div className="text-[11px] mt-0.5 c-dim">87 sold this month</div>
            </div>
            <div className="text-sm font-bold c-orange">$3.99</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 tile-soft-cyan">
              🥊
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Gym Gloves
              </div>
              <div className="text-[11px] mt-0.5 c-dim">62 sold this month</div>
            </div>
            <div className="text-sm font-bold c-cyan">$24.99</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 tile-soft-gold">
              🍫
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Protein Bar
              </div>
              <div className="text-[11px] mt-0.5 c-dim">54 sold this month</div>
            </div>
            <div className="text-sm font-bold gt">$2.99</div>
          </div>
        </div>
      </div>
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text">Equipment Status</h3>
          <span className="badge-active text-[10px] font-bold px-2.5 py-1 rounded-full">
            Updated
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl eq-gold">
            <div className="flex items-center gap-3">
              <span className="text-base">🏋️</span>
              <div>
                <div className="text-sm font-semibold c-text">Treadmills</div>
                <div className="text-[11px] c-dim">12 units</div>
              </div>
            </div>
            <span className="badge-active text-[10px] px-2 py-0.5 rounded-full">
              11 OK
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl eq-orange">
            <div className="flex items-center gap-3">
              <span className="text-base">🚴</span>
              <div>
                <div className="text-sm font-semibold c-text">Spin Bikes</div>
                <div className="text-[11px] c-dim">8 units</div>
              </div>
            </div>
            <span className="badge-pending text-[10px] px-2 py-0.5 rounded-full">
              1 Repair
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl eq-red">
            <div className="flex items-center gap-3">
              <span className="text-base">💪</span>
              <div>
                <div className="text-sm font-semibold c-text">
                  Cable Machine
                </div>
                <div className="text-[11px] c-dim">4 units</div>
              </div>
            </div>
            <span className="badge-expired text-[10px] px-2 py-0.5 rounded-full">
              1 Down
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl eq-gold">
            <div className="flex items-center gap-3">
              <span className="text-base">🏊</span>
              <div>
                <div className="text-sm font-semibold c-text">Pool Area</div>
                <div className="text-[11px] c-dim">Operational</div>
              </div>
            </div>
            <span className="badge-active text-[10px] px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className="band-label">
      <span>Members &amp; Payments</span>
    </div>
    {/* Recent Members · Payments · Renewals */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
      <div className="glass-card hover-lift p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text sec-title">Recent Members</h3>
          <Link href={all_routes.members} className="text-xs font-semibold c-gold">
            View All
          </Link>
        </div>
        <div className="flex flex-col gap-1.5">
          <Link
            href={all_routes.members}
            className="list-row flex items-center gap-3 p-2.5"
          >
            <div className="ring-gold w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-gold overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-01.jpg" alt="avatars" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Ashley Bennett
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                Annual Premium · today
              </div>
            </div>
            <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
              New
            </span>
          </Link>
          <Link
            href={all_routes.members}
            className="list-row flex items-center gap-3 p-2.5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-indigo overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-02.jpg" alt="avatars" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Marcus Coleman
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                Monthly Standard · 2h ago
              </div>
            </div>
            <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
              New
            </span>
          </Link>
          <Link
            href={all_routes.members}
            className="list-row flex items-center gap-3 p-2.5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-orange overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-03.jpg" alt="avatars" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Jessica Ramirez
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                Quarterly Gold · 5h ago
              </div>
            </div>
            <span className="badge-inactive text-[10px] font-bold px-2 py-0.5 rounded-full">
              Referral
            </span>
          </Link>
          <Link
            href={all_routes.members}
            className="list-row flex items-center gap-3 p-2.5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-cyan overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-04.jpg" alt="avatars" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Grant Whitfield
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                Student Plan · yesterday
              </div>
            </div>
            <span className="badge-inactive text-[10px] font-bold px-2 py-0.5 rounded-full">
              Walk-in
            </span>
          </Link>
        </div>
      </div>
      <div className="glass-card hover-lift p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text sec-title">Recent Payments</h3>
          <Link href={all_routes.payments} className="text-xs font-semibold c-gold">
            View All
          </Link>
        </div>
        <div className="flex flex-col gap-1.5">
          <Link
            href={all_routes.payments}
            className="list-row flex items-center gap-3 p-2.5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 tile-soft-gold">
              <Smartphone className="w-[15px] h-[15px] c-green" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Ashley Bennett
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                Apple Pay · #INV-2047
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold gt">$129.00</div>
              <div className="text-[10px] c-green">Success</div>
            </div>
          </Link>
          <Link
            href={all_routes.payments}
            className="list-row flex items-center gap-3 p-2.5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 tile-soft-indigo">
              <CreditCard className="w-[15px] h-[15px] c-indigo" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Marcus Coleman
              </div>
              <div className="text-[11px] mt-0.5 c-dim">Card · #INV-2046</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold c-text">$449.00</div>
              <div className="text-[10px] c-green">Success</div>
            </div>
          </Link>
          <Link
            href={all_routes.payments}
            className="list-row flex items-center gap-3 p-2.5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 tile-soft-gold">
              <Banknote className="w-[15px] h-[15px] c-gold" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Walk-in Customer
              </div>
              <div className="text-[11px] mt-0.5 c-dim">Cash · #INV-2045</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold c-text">$20.00</div>
              <div className="text-[10px] c-green">Success</div>
            </div>
          </Link>
          <Link
            href={all_routes.payments}
            className="list-row flex items-center gap-3 p-2.5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 tile-soft-orange">
              <Wallet className="w-[15px] h-[15px] c-orange" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Kevin Barnes
              </div>
              <div className="text-[11px] mt-0.5 c-dim">Wallet · #INV-2041</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold c-text">$239.00</div>
              <div className="text-[10px] c-orange">Pending</div>
            </div>
          </Link>
        </div>
      </div>
      <div className="glass-card hover-lift p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text sec-title">Upcoming Renewals</h3>
          <span className="badge-pending text-[10px] font-bold px-2.5 py-1 rounded-full">
            24 due
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="list-row flex items-center gap-3 p-2.5 ren-red">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-red overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-05.jpg" alt="avatars" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Brooke Carter
              </div>
              <div className="text-[11px] mt-0.5 c-red">Expires in 2 days</div>
            </div>
            <button
              type="button"
              className="btn-gold text-[10px] font-bold px-2.5 py-1.5"
              onClick={() => showToast("Renewal reminder sent")}
            >
              Renew
            </button>
          </div>
          <div className="list-row flex items-center gap-3 p-2.5 ren-orange">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-orange overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-06.jpg" alt="avatars" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Marcus Coleman
              </div>
              <div className="text-[11px] mt-0.5 c-orange">
                Expires in 5 days
              </div>
            </div>
            <button
              type="button"
              className="btn-ghost text-[10px] font-bold px-2.5 py-1.5"
              onClick={() => showToast("Reminder sent")}
            >
              Remind
            </button>
          </div>
          <div className="list-row flex items-center gap-3 p-2.5 ren-orange">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-gold overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-07.jpg" alt="avatars" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Isabella Romano
              </div>
              <div className="text-[11px] mt-0.5 c-orange">
                Expires in 6 days
              </div>
            </div>
            <button
              type="button"
              className="btn-ghost text-[10px] font-bold px-2.5 py-1.5"
              onClick={() => showToast("Reminder sent")}
            >
              Remind
            </button>
          </div>
          <div className="list-row flex items-center gap-3 p-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 av-grad-indigo overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-08.jpg" alt="avatars" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Kevin Barnes
              </div>
              <div className="text-[11px] mt-0.5 c-dim">Expires in 9 days</div>
            </div>
            <button
              type="button"
              className="btn-ghost text-[10px] font-bold px-2.5 py-1.5"
              onClick={() => showToast("Reminder sent")}
            >
              Remind
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="band-label">
      <span>Operations &amp; Schedule</span>
    </div>
    {/* Activity Timeline · Trainer Schedule */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
      <div className="glass-card hover-lift p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold c-text sec-title">Activity Timeline</h3>
            <p className="text-xs mt-0.5 pl-3 c-dim">
              Live gym operations feed
            </p>
          </div>
          <span className="badge-active text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        </div>
        <div className="timeline">
          <div className="tl-item">
            <div className="tl-dot tl-gold" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold c-text">
                New member registered — Ashley Bennett
              </div>
              <span className="text-[11px] c-dim2">2 min ago</span>
            </div>
            <div className="text-[11px] mt-0.5 c-dim">
              Annual Premium plan · assigned to Daniel Foster
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-dot tl-green" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold c-text">
                Payment received — $18,000
              </div>
              <span className="text-[11px] c-dim2">14 min ago</span>
            </div>
            <div className="text-[11px] mt-0.5 c-dim">
              Card payment from Marcus Coleman · #INV-2046
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-dot tl-orange" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold c-text">
                Low stock alert — Whey Protein
              </div>
              <span className="text-[11px] c-dim2">28 min ago</span>
            </div>
            <div className="text-[11px] mt-0.5 c-dim">
              Only 3 units remaining · reorder suggested
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-dot tl-indigo" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold c-text">
                Class started — Morning Yoga
              </div>
              <span className="text-[11px] c-dim2">41 min ago</span>
            </div>
            <div className="text-[11px] mt-0.5 c-dim">
              17/20 checked in · Hall A · Trainer Rachel
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-dot tl-red" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold c-text">
                Membership expired — Brooke Carter
              </div>
              <span className="text-[11px] c-dim2">1 hr ago</span>
            </div>
            <div className="text-[11px] mt-0.5 c-dim">
              Student Plan · renewal reminder queued
            </div>
          </div>
        </div>
      </div>
      <div className="glass-card hover-lift p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold c-text sec-title">Trainer Schedule</h3>
          <Link href={all_routes.trainers} className="text-xs font-semibold c-gold">
            All
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="list-row flex items-center gap-3 p-2.5">
            <div className="text-center w-11 shrink-0">
              <div className="text-xs font-bold c-gold">7:00</div>
              <div className="text-[9px] c-dim2">AM</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Daniel Foster
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                PT · Strength · Gym Floor
              </div>
            </div>
            <span className="badge-active text-[10px] font-bold px-2 py-0.5 rounded-full">
              Now
            </span>
          </div>
          <div className="list-row flex items-center gap-3 p-2.5">
            <div className="text-center w-11 shrink-0">
              <div className="text-xs font-bold c-indigo">9:30</div>
              <div className="text-[9px] c-dim2">AM</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Rachel Morgan
              </div>
              <div className="text-[11px] mt-0.5 c-dim">Yoga Flow · Hall A</div>
            </div>
            <span className="badge-inactive text-[10px] font-bold px-2 py-0.5 rounded-full">
              Next
            </span>
          </div>
          <div className="list-row flex items-center gap-3 p-2.5">
            <div className="text-center w-11 shrink-0">
              <div className="text-xs font-bold c-orange">11:00</div>
              <div className="text-[9px] c-dim2">AM</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Andre Jackson
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                HIIT Blast · Studio B
              </div>
            </div>
            <span className="badge-inactive text-[10px] font-bold px-2 py-0.5 rounded-full">
              11:00
            </span>
          </div>
          <div className="list-row flex items-center gap-3 p-2.5">
            <div className="text-center w-11 shrink-0">
              <div className="text-xs font-bold c-cyan">5:00</div>
              <div className="text-[9px] c-dim2">PM</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold c-text truncate">
                Lauren Hayes
              </div>
              <div className="text-[11px] mt-0.5 c-dim">
                Zumba Dance · Hall A
              </div>
            </div>
            <span className="badge-inactive text-[10px] font-bold px-2 py-0.5 rounded-full">
              5:00
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* /dashboard */}

  <ExportReportModal
    open={exportOpen}
    onClose={() => setExportOpen(false)}
    onDownload={() => {
      setExportOpen(false);
      showToast("Report downloaded");
    }}
  />
  <Toast message={message} visible={visible} />
</>


  )
}

export default Dashboard