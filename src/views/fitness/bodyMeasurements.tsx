import { useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Download,
  Dumbbell,
  Edit2,
  Eye,
  GitCompare,
  History,
  Minus,
  MoreVertical,
  Percent,
  Plus,
  Scale,
  Trash2,
  User,
} from "lucide-react";
import { BM_MEMBERS, CHART } from "../../utils/json/bodyMeasurementsData";
import RowMenu from "../../components/common/rowMenu";
import Toast from "../../components/common/Toast";
import useBodyMeasurements, { deltaClass } from "./useBodyMeasurements";
import MeasureFormModal from "./modal/measureFormModal";
import MeasureViewModal from "./modal/measureViewModal";
import MeasureCompareModal from "./modal/measureCompareModal";
import MeasureHistoryModal from "./modal/measureHistoryModal";
import MeasureDeleteModal from "./modal/measureDeleteModal";

/*
   Body Measurements — ported from tailwind/src/body-measurements.html and
   assets/js/body-measurements.js. SVG weight-trend chart, measurement bars,
   history log and the full modal suite.
*/

/** Metric-card delta pill, replacing setDelta()'s manual DOM writes. */
const Delta = ({
  diff,
  goodDown,
  unit,
}: {
  diff: number;
  goodDown: boolean;
  unit: string;
}) => {
  const flat = Math.abs(diff) < 0.05;
  const Arrow = flat ? Minus : diff > 0 ? ArrowUp : ArrowDown;
  return (
    <span className={deltaClass(diff, goodDown)}>
      <Arrow className="size-px-11 shrink-0" aria-hidden="true" />
      {Math.abs(diff).toFixed(1)}
      {unit}
    </span>
  );
};

type ModalKind = "form" | "view" | "compare" | "history" | "delete";

const BodyMeasurements = () => {
  const page = useBodyMeasurements();
  const { log, metrics, chart, measures, range, setRange, member } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const target = targetId != null ? page.find(targetId) : null;
  /* The next-older entry, used for the View modal's deltas. */
  const targetIndex = log.findIndex((l) => l.id === targetId);
  const previous = targetIndex >= 0 ? (log[targetIndex + 1] ?? null) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  const openCompare = () => {
    if (!page.canCompare()) return;
    setModal("compare");
  };

  const { W, H, padL, padR } = CHART;

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Body Measurements</h2>
          <p className="text-sm mt-0.5 c-dim">
            Track member progress, weight &amp; body composition
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] c-dim shrink-0"
              aria-hidden="true"
            />
            <select
              className="fp-input py-2 pl-9 text-sm w-auto"
              value={member}
              onChange={(e) => page.selectMember(e.target.value)}
            >
              {BM_MEMBERS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={openCompare}
          >
            <GitCompare className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Compare
          </button>
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={page.exportReport}
          >
            <Download className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("form", null)}
          >
            <Plus className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            Log Measurement
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="sc-fitness-metric reveal">
          <div className="flex items-center justify-between mb-3">
            <div className="metric-ic ic-gold">
              <Scale className="w-[17px] h-[17px] c-gold shrink-0" aria-hidden="true" />
            </div>
            {metrics && <Delta diff={metrics.dWeight} goodDown unit="lbs" />}
          </div>
          <div className="text-2xl font-black c-text leading-none">
            {metrics?.cur.weight.toFixed(1)} <span className="text-sm c-dim">lbs</span>
          </div>
          <div className="text-xs c-dim mt-1">Current Weight</div>
        </div>
        <div className="sc-fitness-metric reveal">
          <div className="flex items-center justify-between mb-3">
            <div className="metric-ic ic-green">
              <Activity className="w-[17px] h-[17px] c-green shrink-0" aria-hidden="true" />
            </div>
            {metrics && <Delta diff={metrics.dBmi} goodDown unit="" />}
          </div>
          <div className="text-2xl font-black c-text leading-none">
            {metrics?.cur.bmi.toFixed(1)}
          </div>
          <div className="text-xs c-dim mt-1">Body Mass Index</div>
        </div>
        <div className="sc-fitness-metric reveal">
          <div className="flex items-center justify-between mb-3">
            <div className="metric-ic ic-cyan">
              <Percent className="w-[17px] h-[17px] c-cyan shrink-0" aria-hidden="true" />
            </div>
            {metrics && <Delta diff={metrics.dFat} goodDown unit="%" />}
          </div>
          <div className="text-2xl font-black c-text leading-none">
            {metrics?.cur.fat.toFixed(1)} <span className="text-sm c-dim">%</span>
          </div>
          <div className="text-xs c-dim mt-1">Body Fat</div>
        </div>
        <div className="sc-fitness-metric reveal">
          <div className="flex items-center justify-between mb-3">
            <div className="metric-ic ic-purple">
              <Dumbbell className="w-[17px] h-[17px] c-purple shrink-0" aria-hidden="true" />
            </div>
            {metrics && <Delta diff={metrics.dMuscle} goodDown={false} unit="lbs" />}
          </div>
          <div className="text-2xl font-black c-text leading-none">
            {metrics?.cur.muscle.toFixed(1)} <span className="text-sm c-dim">lbs</span>
          </div>
          <div className="text-xs c-dim mt-1">Muscle Mass</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Weight trend chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold c-text sec-title">Weight Trend</h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={range === 6 ? "range-tab active" : "range-tab"}
                onClick={() => setRange(6)}
              >
                6M
              </button>
              <button
                type="button"
                className={range === 12 ? "range-tab active" : "range-tab"}
                onClick={() => setRange(12)}
              >
                1Y
              </button>
            </div>
          </div>
          <div className="chart-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full instyle-1">
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(212,175,55,0.28)" />
                  <stop offset="100%" stopColor="rgba(212,175,55,0)" />
                </linearGradient>
              </defs>
              {chart.grid.map((line) => (
                <g key={line.y}>
                  <line
                    x1={padL}
                    y1={line.y}
                    x2={W - padR}
                    y2={line.y}
                    stroke="#2E2E34"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={padL - 8}
                    y={line.y + 3}
                    fill="#4B5563"
                    fontSize="9"
                    textAnchor="end"
                  >
                    {line.label}
                  </text>
                </g>
              ))}
              <polygon points={chart.areaPts} fill="url(#wg)" />
              <polyline
                points={chart.linePts}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {chart.points.map((p) => (
                <circle key={`${p.label}-${p.x}`} className="chart-dot" cx={p.x} cy={p.y} r="3.5">
                  <title>
                    {p.label}: {p.value} lbs
                  </title>
                </circle>
              ))}
              {chart.points.map((p) => (
                <text
                  key={`lbl-${p.label}-${p.x}`}
                  x={p.x}
                  y={H - 8}
                  fill="#6B7280"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* BMI gauge + goal */}
        <div className="space-y-5">
          <div className="glass-card p-5">
            <h3 className="font-bold c-text sec-title mb-4">BMI Status</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-black gt leading-none">22.7</div>
              <div className="text-[12px] c-green font-semibold mt-1">Normal / Healthy</div>
            </div>
            <div className="bmi-scale mb-2">
              <div className="bmi-marker instyle-2" />
            </div>
            <div className="flex justify-between text-[9px] c-dim2 font-semibold">
              <span>Under</span>
              <span>Normal</span>
              <span>Over</span>
              <span>Obese</span>
            </div>
          </div>
          <div className="gold-border-card p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold c-text sec-title">Goal Progress</h3>
              <span className="text-[11px] c-gold font-bold">Target: 128 lbs</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-black gt leading-none">52%</span>
              <span className="text-[11px] c-dim mb-0.5">to goal</span>
            </div>
            <div className="goal-track">
              <div className="goal-fill instyle-3" />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] c-dim">
              <span>Start: 145.6 lbs</span>
              <span>Now: 136.4 lbs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Measurements table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Body measurements */}
        <div className="glass-card p-5">
          <h3 className="font-bold c-text sec-title mb-4">Body Measurements (in)</h3>
          <div className="space-y-3">
            {measures.map((m) => {
              const Arrow = m.flat ? Minus : m.diff > 0 ? ArrowUp : ArrowDown;
              return (
                <div key={m.part}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-semibold c-text2">{m.part}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold c-text">
                        {m.val} {m.unit}
                      </span>
                      <span className={`delta ${m.cls}`}>
                        <Arrow
                          style={{ width: "10px", height: "10px" }}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                        {Math.abs(m.diff).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="goal-track">
                    <div className="goal-fill" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* History log */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 pb-3 flex items-center justify-between">
            <h3 className="font-bold c-text sec-title">Measurement Log</h3>
            <button
              type="button"
              className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
              onClick={() => setModal("history")}
            >
              <History className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Full History
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table min-w-[460px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>BMI</th>
                  <th>Body Fat</th>
                  <th>Muscle</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => open("view", l.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") open("view", l.id);
                    }}
                  >
                    <td className="text-[12px] c-dim">{l.date}</td>
                    <td className="font-bold c-text">{l.weight.toFixed(1)} lbs</td>
                    <td>{l.bmi.toFixed(1)}</td>
                    <td className="c-cyan">{l.fat.toFixed(1)}%</td>
                    <td className="c-purple">{l.muscle.toFixed(1)} lbs</td>
                    <td className="text-right">
                      <RowMenu
                        triggerClassName="log-menu-btn"
                        triggerTitle="More"
                        trigger={
                          <MoreVertical
                            className="w-[14px] h-[14px] shrink-0"
                            aria-hidden="true"
                          />
                        }
                      >
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => open("view", l.id)}
                        >
                          <Eye className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                          View Entry
                        </button>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => open("form", l.id)}
                        >
                          <Edit2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                          Edit Entry
                        </button>
                        <div className="menu-sep" />
                        <button
                          type="button"
                          className="dropdown-item danger"
                          onClick={() => open("delete", l.id)}
                        >
                          <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                          Delete
                        </button>
                      </RowMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <MeasureFormModal
        key={`form-${target?.id ?? "new"}`}
        open={modal === "form"}
        target={modal === "form" ? target : null}
        onClose={close}
        onSubmit={page.saveEntry}
      />
      <MeasureViewModal
        entry={modal === "view" ? target : null}
        previous={previous}
        onClose={close}
        onEdit={() => setModal("form")}
      />
      <MeasureCompareModal
        key={`compare-${log.length}`}
        open={modal === "compare"}
        log={log}
        onClose={close}
      />
      <MeasureHistoryModal
        open={modal === "history"}
        log={log}
        onClose={close}
        onExport={page.exportReport}
      />
      <MeasureDeleteModal
        entry={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.deleteEntry}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default BodyMeasurements;
