import { useState } from "react";
import CommonSelect, {
  CommonTagInput,
  type Option,
} from "../../../components/common-select/commonSelect";
import MultipleSelect from "../../../components/multiple-Select/multipleSelect";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import CommonTimePicker from "../../../components/common-time-picker/commonTimePicker";
import PredefinedDatePicker from "../../../components/common-date-range-picker/PredefinedDatePicker";
import CommonTagInputs from "../../../components/common-tag-input/commonTagInputs";
import CommonRangeSlider from "../../../components/common-range-slider/commonRangeSlider";
import Datatable from "../../../components/data-table";
import Breadcrumb from "../../../components/breadcrumb/breadcrumb";
import PasswordInput from "../../../components/password-input/PasswordInput";
import type { DatatableColumns } from "../../../core/data/interface";

const planOptions: Option[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half-yearly", label: "Half Yearly" },
  { value: "annual", label: "Annual" },
];

const trainerOptions = [
  { value: "alex", label: "Alex Carter" },
  { value: "brooke", label: "Brooke Nolan" },
  { value: "dev", label: "Dev Sharma" },
  { value: "mia", label: "Mia Alvarez" },
];

const members = [
  {
    key: "1",
    name: "Jordan Blake",
    plan: "Annual",
    trainer: "Alex Carter",
    status: "Active",
    joined: "2026-01-12",
  },
  {
    key: "2",
    name: "Riya Menon",
    plan: "Monthly",
    trainer: "Mia Alvarez",
    status: "Active",
    joined: "2026-03-04",
  },
  {
    key: "3",
    name: "Sam Okafor",
    plan: "Quarterly",
    trainer: "Dev Sharma",
    status: "Paused",
    joined: "2026-02-19",
  },
  {
    key: "4",
    name: "Lena Fischer",
    plan: "Annual",
    trainer: "Brooke Nolan",
    status: "Expired",
    joined: "2025-11-27",
  },
];

const statusTone: Record<string, string> = {
  Active: "bg-[rgba(52,211,153,0.15)] text-[#34d399]",
  Paused: "bg-[rgba(251,191,36,0.15)] text-[#fbbf24]",
  Expired: "bg-[rgba(248,113,113,0.15)] text-[#f87171]",
};

const columns: DatatableColumns = [
  { title: "Member", dataIndex: "name", key: "name" },
  { title: "Plan", dataIndex: "plan", key: "plan" },
  { title: "Trainer", dataIndex: "trainer", key: "trainer" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (value: string) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-[calc(6px*var(--rs))] text-[calc(11px*var(--fs))] font-semibold ${
          statusTone[value] ?? ""
        }`}
      >
        {value}
      </span>
    ),
  },
  { title: "Joined", dataIndex: "joined", key: "joined" },
];

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium mb-2 c-text">{label}</label>
    {children}
    {hint && <p className="mt-1.5 text-[11px] c-dim">{hint}</p>}
  </div>
);

const Card = ({
  title,
  description,
  className = "",
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <section className={`glass-card p-5 ${className}`}>
    <header className="mb-4">
      <h2 className="text-base font-black c-text leading-none">{title}</h2>
      <p className="text-xs mt-1.5 c-dim">{description}</p>
    </header>
    {children}
  </section>
);

const BlankPage = () => {
  const [plan, setPlan] = useState<Option | null>(planOptions[0]);
  const [trainers, setTrainers] = useState<string[]>(["alex", "mia"]);
  const [tags, setTags] = useState<string[]>(["strength", "cardio"]);
  const [interests, setInterests] = useState<Option[]>([]);
  const [priceRange, setPriceRange] = useState<number | [number, number]>([
    20, 80,
  ]);
  const [searchText, setSearchText] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black c-text leading-none">
          Component Gallery
        </h1>
        <p className="text-xs mt-1.5 c-dim">
          Shared form controls, all rendered by PrimeReact in unstyled mode and
          themed with the Dreams GYM tokens.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title="Selects"
          description="Single select, multi-select with chips, and a tag-style picker."
        >
          <div className="space-y-4">
            <Field label="Membership Plan" hint={`Selected: ${plan?.label ?? "none"}`}>
              <CommonSelect
                options={planOptions}
                defaultValue={planOptions[0]}
                placeholder="Choose a plan"
                ariaLabel="Membership plan"
                onChange={setPlan}
              />
            </Field>

            <Field
              label="Assigned Trainers"
              hint={`${trainers.length} selected`}
            >
              <MultipleSelect
                options={trainerOptions}
                value={trainers}
                onChange={setTrainers}
                placeholder="Select trainers"
                ariaLabel="Assigned trainers"
                filter
              />
            </Field>

            <Field label="Interests" hint={`${interests.length} selected`}>
              <CommonTagInput
                options={trainerOptions}
                placeholder="Pick interests"
                ariaLabel="Interests"
                onChange={setInterests}
              />
            </Field>
          </div>
        </Card>

        <Card
          title="Date & Time"
          description="Calendar-backed date, time and range pickers."
        >
          <div className="space-y-4">
            <Field label="Join Date">
              <CommonDatePicker placeholder="dd/mm/yyyy" ariaLabel="Join date" />
            </Field>

            <Field label="Session Time">
              <CommonTimePicker
                placeholder="hh:mm"
                ariaLabel="Session time"
              />
            </Field>

            <Field label="Reporting Period" hint="Presets available in the panel footer.">
              <PredefinedDatePicker ariaLabel="Reporting period" />
            </Field>
          </div>
        </Card>

        <Card
          title="Tags & Slider"
          description="Free-text tag entry and a two-handle range slider."
        >
          <div className="space-y-4">
            <Field label="Workout Tags" hint={`Tags: ${tags.join(", ") || "none"}`}>
              <CommonTagInputs
                initialTags={tags}
                onTagsChange={setTags}
                placeholder="Type and press Enter"
                ariaLabel="Workout tags"
              />
            </Field>

            <Field label="Price Range">
              <CommonRangeSlider
                min={0}
                max={100}
                defaultValue={priceRange}
                onChange={setPriceRange}
                valuePrefix="$"
                ariaLabel="Price range"
              />
            </Field>
          </div>
        </Card>

        <Card
          title="Breadcrumb"
          description="Derived from the route by default; overridable per page."
        >
          <div className="space-y-4">
            <Field label="Automatic" hint="Reads the current route via routeMeta.">
              <Breadcrumb />
            </Field>

            <Field
              label="Explicit items"
              hint="For detail pages the route map cannot know."
            >
              <Breadcrumb
                items={[
                  { label: "Members", href: "/members" },
                  { label: "Jordan Blake" },
                ]}
              />
            </Field>

            <Field
              label="Collapsed"
              hint="maxItems={3} elides the middle of a long trail."
            >
              <Breadcrumb
                maxItems={3}
                items={[
                  { label: "Fitness", href: "/classes" },
                  { label: "Trainers", href: "/trainers" },
                  { label: "Alex Carter", href: "/trainer-profile" },
                  { label: "PT Sessions" },
                ]}
              />
            </Field>
          </div>
        </Card>

        <Card
          title="Password"
          description="Reveal toggle with an accessible pressed state."
        >
          <Field label="Password" hint="The eye button toggles visibility.">
            <PasswordInput id="demo-password" autoComplete="new-password" />
          </Field>
        </Card>

        <Card
          title="Data Table"
          description="Sorting, filtering, column toggles and row selection."
          className="lg:col-span-2"
        >
          <Datatable
            columns={columns}
            dataSource={members}
            Selection
            searchText={searchText}
            filterColumns={["plan", "status"]}
            sortColumn="name"
            dateColumn="joined"
            toolbarLeft={
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search members…"
                className="fp-input h-8 w-56 text-[calc(12px*var(--fs))]"
                aria-label="Search members"
              />
            }
          />
        </Card>
      </div>
    </div>
  );
};

export default BlankPage;
