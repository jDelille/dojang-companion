import { type ReactNode } from "react";
import { Check, OctagonAlert, Search } from "lucide-react";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import CommonTimePicker from "../../../components/common-time-picker/commonTimePicker";
import PasswordInput from "../../../components/password-input/PasswordInput";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/*
   Ported from tailwind/src/form-elements.html. The template's `<pre class="code">`
   blocks are escaped copies of the markup shown above them, so only the live
   preview is carried across; the toggle keeps the card header identical.
*/

type PreviewCardProps = {
  title: string;
  children: ReactNode;
  contentClassName?: string;
  code: string;
};

const PreviewCard = ({ title, children, contentClassName = "", code }: PreviewCardProps) => (
  <PreviewCodeToggle
    title={title}
    code={code}
    cardShellClassName="preview-card col-span-12 bg-[var(--card)] rounded-md border border-[var(--border)] p-5"
    contentClassName={contentClassName}
  >
    {children}
  </PreviewCodeToggle>
);

const COL = "col-span-12 sm:col-span-6 md:col-span-4";
const INPUT =
  "fp-input block w-full py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none";
const GROUP_LABEL = "block text-sm font-medium mb-2 c-text";
const GROUP_ADDON =
  "flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-[var(--text2)] text-sm";
const GROUP_INPUT =
  "fp-input border-[var(--border)] block w-full text-sm focus:ring-0 placeholder:text-gray-400 focus:outline-none";
const GROUP_BUTTON =
  "flex items-center justify-center px-3 border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm font-medium hover:bg-gray-50 focus:outline-hidden transition-all";
const CHECK_BASE =
  "shrink-0 border-[var(--border)] disabled:opacity-50 disabled:pointer-events-none";
const SWITCH_TRACK =
  "absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-disabled:opacity-50 peer-disabled:pointer-events-none";
const SWITCH_KNOB =
  "absolute top-1/2 start-1 -translate-y-1/2 size-3 bg-white dark:bg-dark rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full";

type Tone = "primary" | "warning" | "dark" | "success" | "danger" | "info";

type ToneEntry = {
  id: Tone;
  label: string;
  check: string;
  radio: string;
  switchTrack: string;
};

/* Tailwind scans class strings statically, so every tone variant is spelled out. */
const COLOR_TONES: ToneEntry[] = [
  {
    id: "primary",
    label: "Primary",
    check: "text-primary focus:ring-primary checked:border-primary",
    radio: "text-primary focus:ring-primary checked:border-primary",
    switchTrack: "peer-checked:bg-primary dark:peer-checked:bg-primary",
  },
  {
    id: "warning",
    label: "Warning",
    check: "text-warning focus:ring-warning checked:border-warning",
    radio: "text-warning focus:ring-warning checked:border-warning",
    switchTrack: "peer-checked:bg-warning dark:peer-checked:bg-warning",
  },
  {
    id: "dark",
    label: "Dark",
    check: "text-dark focus:ring-dark checked:border-dark",
    radio: "text-dark focus:ring-dark checked:border-dark",
    switchTrack: "peer-checked:bg-dark dark:peer-checked:bg-dark",
  },
  {
    id: "success",
    label: "Success",
    check: "text-success focus:ring-success checked:border-success",
    radio: "text-success focus:ring-success checked:border-success",
    switchTrack: "peer-checked:bg-success dark:peer-checked:bg-success",
  },
  {
    id: "danger",
    label: "Danger",
    check: "text-danger focus:ring-danger checked:border-danger",
    radio: "text-danger focus:ring-danger checked:border-danger",
    switchTrack: "peer-checked:bg-danger dark:peer-checked:bg-danger",
  },
  {
    id: "info",
    label: "Info",
    check: "text-info focus:ring-info checked:border-info",
    radio: "text-info focus:ring-info checked:border-info",
    switchTrack: "peer-checked:bg-info dark:peer-checked:bg-info",
  },
];

type TextField = {
  id: string;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  defaultValue?: string;
};

const TEXT_FIELDS_A: TextField[] = [
  { id: "simple-input", label: "Simple Input" },
  { id: "label-input", label: "Label Input" },
];

const TEXT_FIELDS_B: TextField[] = [
  {
    id: "rounded-input",
    label: "Rounded Input",
    placeholder: "Rounded Input",
    className:
      "fp-input px-4.5 block w-full py-2.5 text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none",
  },
  { id: "placeholder-input", label: "Placeholder", placeholder: "placeholder" },
  {
    id: "disabled-input",
    label: "Disabled",
    placeholder: "Disabled",
    readOnly: true,
    className: `${INPUT} cursor-not-allowed`,
  },
  {
    id: "readonly-input",
    label: "Readonly",
    placeholder: "Readonly",
    readOnly: true,
    className: `${INPUT} cursor-not-allowed`,
  },
  { id: "value-input", label: "Value", placeholder: "", defaultValue: "Value" },
];

type TypedField = { id: string; label: string; type: string; placeholder: string };

const TYPED_FIELDS: TypedField[] = [
  { id: "url-input", label: "Url", type: "url", placeholder: "http://example.com" },
  { id: "tel-input", label: "Tel", type: "url", placeholder: "+1100-2031-1233" },
];

type AddonGroup = {
  key: string;
  label: string;
  id: string;
  leading?: string[];
  trailing?: string;
  placeholder: string;
};

const ADDON_GROUPS: AddonGroup[] = [
  {
    key: "left",
    label: "Group Left",
    id: "input-group-left",
    leading: ["@"],
    placeholder: "Username",
  },
  {
    key: "right",
    label: "Group Right",
    id: "input-group-right",
    trailing: "@example.com",
    placeholder: "Recipient's",
  },
  {
    key: "url",
    label: "URL Example",
    id: "url-example",
    leading: ["https://example.com"],
    placeholder: "",
  },
  { key: "left2", label: "Group Left", id: "group-left2", leading: ["$"], placeholder: "123" },
  {
    key: "currency",
    label: "Group Left With Currency",
    id: "group-left-currency",
    leading: ["$", "0.00"],
    placeholder: "123",
  },
  {
    key: "both",
    label: "Group With Currency",
    id: "group-with-currency",
    leading: ["$"],
    trailing: ".00",
    placeholder: "123",
  },
];

const RANGE_SLIDER_CLASS = `w-full border-0 bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden form-input focus:ring-0 focus:outline-none focus:border-[var(--border)]
  [&::-webkit-slider-thumb]:w-2.5
  [&::-webkit-slider-thumb]:h-2.5
  [&::-webkit-slider-thumb]:-mt-0.5
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:bg-[var(--card)]
  [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:transition-all
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:ease-in-out
  [&::-moz-range-thumb]:w-2.5
  [&::-moz-range-thumb]:appearance-none
  [&::-moz-range-thumb]:bg-[var(--card)]
  [&::-moz-range-thumb]:border-4
  [&::-moz-range-thumb]:border-blue-600
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:transition-all
  [&::-moz-range-thumb]:duration-150
  [&::-moz-range-thumb]:ease-in-out
  [&::-webkit-slider-runnable-track]:w-full
  [&::-webkit-slider-runnable-track]:bg-gray-100
  [&::-webkit-slider-runnable-track]:rounded-full
  [&::-moz-range-track]:w-full
  [&::-moz-range-track]:bg-gray-100
  [&::-moz-range-track]:rounded-full`;

const Switch = ({
  id,
  label,
  trackClassName,
  defaultChecked,
}: {
  id: string;
  label: string;
  trackClassName: string;
  defaultChecked?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <label htmlFor={id} className="relative inline-block w-8 h-5 cursor-pointer">
      <input type="checkbox" id={id} className="peer sr-only" defaultChecked={defaultChecked} />
      <span className={`${SWITCH_TRACK} ${trackClassName}`} />
      <span className={SWITCH_KNOB} />
    </label>
    <label htmlFor={id}>{label}</label>
  </div>
);

const FormElements = () => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
      <h1 className="text-xl font-black c-text mb-0">Form Elements</h1>
    </div>

    {/* Start Grid */}
    <div className="grid grid-cols-12 gap-6">
      <PreviewCard
        title="Input Text Field Type"
        contentClassName="grid grid-cols-12 gap-5"
        code={`<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="simple-input" class="set-label">Simple Input</label>
	<input id="simple-input" type="text" class="fp-input block w-full py-2.5 text-sm">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="label-input" class="set-label">Label Input</label>
	<input id="label-input" type="text" class="fp-input block w-full py-2.5 text-sm">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="search-input" class="set-label">Type Search</label>
	<div class="relative">
		<input id="search-input" type="search" class="pl-8! fp-input block w-full py-2.5 text-sm" placeholder="Search">
		<div class="absolute top-1/2 start-2.5 -translate-y-1/2 pointer-events-none">
			<i class="icon icon-search"></i>
		</div>
	</div>
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="hs-validation-name-error" class="set-label">Valid Input</label>
	<div class="relative">
		<input type="text" id="hs-validation-name-error" class="fp-input block w-full border-success py-2.5 text-sm" required>
		<div class="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
			<i class="icon icon-check c-green"></i>
		</div>
	</div>
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="hs-validation-name-error2" class="set-label">Invalid Input</label>
	<div class="relative">
		<input type="text" id="hs-validation-name-error2" class="fp-input block w-full border-danger py-2.5 text-sm" required>
		<div class="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
			<i class="icon icon-octagon-alert c-red"></i>
		</div>
	</div>
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="rounded-input" class="set-label">Rounded Input</label>
	<input type="text" id="rounded-input" class="fp-input px-4.5 block w-full py-2.5 text-sm rounded-full" placeholder="Rounded Input">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="placeholder-input" class="set-label">Placeholder</label>
	<input type="text" id="placeholder-input" class="fp-input block w-full py-2.5 text-sm" placeholder="placeholder">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="disabled-input" class="set-label">Disabled</label>
	<input type="text" id="disabled-input" class="fp-input block w-full py-2.5 text-sm cursor-not-allowed" placeholder="Disabled" readonly>
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="readonly-input" class="set-label">Readonly</label>
	<input type="text" id="readonly-input" class="fp-input block w-full py-2.5 text-sm cursor-not-allowed" placeholder="Readonly" readonly>
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="value-input" class="set-label">Value</label>
	<input type="text" id="value-input" class="fp-input block w-full py-2.5 text-sm" value="Value">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="textarea-input" class="set-label">Textarea</label>
	<textarea id="textarea-input" class="fp-input block w-full py-2.5 text-sm" rows="3"></textarea>
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="select-input" class="set-label">Select</label>
	<select id="select-input" class="fp-input block w-full py-2.5 text-sm">
		<option>Open this select menu</option>
		<option>1</option>
		<option>2</option>
		<option>3</option>
	</select>
</div>`}
      >
        {TEXT_FIELDS_A.map((field) => (
          <div key={field.id} className={COL}>
            <label htmlFor={field.id} className="set-label">
              {field.label}
            </label>
            <input id={field.id} type="text" className={INPUT} />
          </div>
        ))}

        <div className={COL}>
          <label htmlFor="search-input" className="set-label">
            Type Search
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="search"
              name="hs-leading-icon"
              className={`pl-8! ${INPUT}`}
              placeholder="Search"
            />
            <div className="absolute top-1/2 start-2.5 -translate-y-1/2 pointer-events-none">
              <Search className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className={COL}>
          <label htmlFor="hs-validation-name-error" className="set-label">
            Valid Input
          </label>
          <div className="relative">
            <input
              type="text"
              id="hs-validation-name-error"
              name="hs-validation-name-error"
              className="fp-input block w-full border-success py-2.5 text-sm focus:border-success"
              required
              aria-describedby="hs-validation-name-error"
            />
            <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
              <Check className="w-4 h-4 c-green" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className={COL}>
          <label htmlFor="hs-validation-name-error2" className="set-label">
            Invalid Input
          </label>
          <div className="relative">
            <input
              type="text"
              id="hs-validation-name-error2"
              name="hs-validation-name-error2"
              className="fp-input block w-full border-danger py-2.5 text-sm focus:border-danger"
              required
              aria-describedby="hs-validation-name-error2"
            />
            <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
              <OctagonAlert className="w-4 h-4 c-red" aria-hidden="true" />
            </div>
          </div>
        </div>

        {TEXT_FIELDS_B.map((field) => (
          <div key={field.id} className={COL}>
            <label htmlFor={field.id} className="set-label">
              {field.label}
            </label>
            <input
              type="text"
              id={field.id}
              className={field.className ?? INPUT}
              placeholder={field.placeholder}
              readOnly={field.readOnly}
              defaultValue={field.defaultValue}
            />
          </div>
        ))}

        <div className={COL}>
          <label htmlFor="textarea-input" className="set-label">
            Textarea
          </label>
          <textarea id="textarea-input" className={INPUT} rows={3} placeholder="" />
        </div>

        <div className={COL}>
          <label htmlFor="select-input" className="set-label">
            Select
          </label>
          <select id="select-input" className={INPUT} defaultValue="Open this select menu">
            <option>Open this select menu</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
        </div>
      </PreviewCard>

      <PreviewCard
        title="Input Types"
        contentClassName="grid grid-cols-12 gap-5"
        code={`<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="email-input" class="set-label">Email</label>
	<input type="email" id="email-input" class="fp-input block w-full py-2.5 text-sm" placeholder="email@xyz.com">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="hs-toggle-password" class="set-label">Password</label>
	<input type="password" id="hs-toggle-password" class="fp-input block w-full py-2.5 text-sm" placeholder="Enter password" value="12345qwerty">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="file-input" class="set-label">File</label>
	<input type="file" id="file-input" class="fp-input block w-full py-2.5 text-sm">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="url-input" class="set-label">Url</label>
	<input type="url" id="url-input" class="fp-input block w-full py-2.5 text-sm" placeholder="http://example.com">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="tel-input" class="set-label">Tel</label>
	<input type="url" id="tel-input" class="fp-input block w-full py-2.5 text-sm" placeholder="+1100-2031-1233">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="date-input" class="set-label">Date</label>
	<input type="text" id="date-input" class="fp-input block w-full py-2.5 text-sm" data-provider="flatpickr">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="datetime-input" class="set-label">Date &amp; Time</label>
	<input type="text" id="datetime-input" class="fp-input block w-full py-2.5 text-sm" data-provider="flatpickr" data-enable-time="true">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="time-input" class="set-label">Time</label>
	<input type="text" id="time-input" class="fp-input block w-full py-2.5 text-sm" data-provider="timepickr">
</div>
<div class="col-span-12 sm:col-span-6 md:col-span-4">
	<label for="color-input" class="set-label">Color picker</label>
	<input type="color" id="color-input" class="fp-input h-[42px] block w-full" value="#2563eb" title="Choose your color">
</div>
<div class="col-span-12">
	<label for="basic-range-slider-usage" class="set-label">Range Slider</label>
	<input type="range" id="basic-range-slider-usage" class="w-full form-input">
</div>`}
      >
        <div className={COL}>
          <label htmlFor="email-input" className="set-label">
            Email
          </label>
          <input type="email" id="email-input" className={INPUT} placeholder="email@xyz.com" />
        </div>

        <div className={COL}>
          <label htmlFor="hs-toggle-password" className="set-label">
            Password
          </label>
          <PasswordInput
            id="hs-toggle-password"
            className={INPUT}
            icon={null}
            placeholder="Enter password"
            defaultValue="12345qwerty"
          />
        </div>

        <div className={COL}>
          <label htmlFor="file-input" className="set-label">
            File
          </label>
          <input
            type="file"
            name="file-input"
            id="file-input"
            className="fp-input block w-full py-2.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-semibold disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          />
        </div>

        {TYPED_FIELDS.map((field) => (
          <div key={field.id} className={COL}>
            <label htmlFor={field.id} className="set-label">
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              className={INPUT}
              placeholder={field.placeholder}
            />
          </div>
        ))}

        <div className={COL}>
          <label htmlFor="date-input" className="set-label">
            Date
          </label>
          <CommonDatePicker inputId="date-input" dateFormat="dd.mm.y" ariaLabel="Date" />
        </div>

        <div className={COL}>
          <label htmlFor="datetime-input" className="set-label">
            Date &amp; Time
          </label>
          <CommonDatePicker
            inputId="datetime-input"
            dateFormat="dd.mm.y"
            showTime
            ariaLabel="Date and time"
          />
        </div>

        <div className={COL}>
          <label htmlFor="time-input" className="set-label">
            Time
          </label>
          <CommonTimePicker inputId="time-input" ariaLabel="Time" />
        </div>

        <div className={COL}>
          <label htmlFor="color-input" className="set-label">
            Color picker
          </label>
          <input
            type="color"
            id="color-input"
            className="fp-input h-[42px] block w-full cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            defaultValue="#2563eb"
            title="Choose your color"
          />
        </div>

        <div className="col-span-12">
          <label htmlFor="basic-range-slider-usage" className="set-label">
            Range Slider
          </label>
          <input
            type="range"
            className={RANGE_SLIDER_CLASS}
            id="basic-range-slider-usage"
            aria-orientation="horizontal"
          />
        </div>
      </PreviewCard>

      <PreviewCard
        title="Input Group"
        contentClassName="grid grid-cols-12 gap-5"
        code={`<div class="col-span-12 sm:col-span-6">
	<label for="input-group-left" class="block text-sm font-medium mb-2 c-text">Group Left</label>
	<div class="flex">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm border-r-0 rounded-l-md">@</span>
		<input id="input-group-left" type="text" class="fp-input border-[var(--border)] block w-full text-sm rounded-l-none rounded-r-md" placeholder="Username">
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="input-group-right" class="block text-sm font-medium mb-2 c-text">Group Right</label>
	<div class="flex">
		<input id="input-group-right" type="text" class="fp-input border-[var(--border)] block w-full text-sm rounded-r-none rounded-l-md" placeholder="Recipient's">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm rounded-r-md border-l-0">@example.com</span>
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="url-example" class="block text-sm font-medium mb-2 c-text">URL Example</label>
	<div class="flex">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm border-r-0 rounded-l-md">https://example.com</span>
		<input id="url-example" type="text" class="fp-input border-[var(--border)] block w-full text-sm rounded-l-none rounded-r-md">
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="group-left2" class="block text-sm font-medium mb-2 c-text">Group Left</label>
	<div class="flex">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm border-r-0 rounded-l-md">$</span>
		<input id="group-left2" type="text" class="fp-input border-[var(--border)] block w-full text-sm rounded-l-none rounded-r-md" placeholder="123">
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="group-left-currency" class="block text-sm font-medium mb-2 c-text">Group Left With Currency</label>
	<div class="flex">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm border-r-0 rounded-l-md">$</span>
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm border-r-0 shrink-0">0.00</span>
		<input id="group-left-currency" type="text" class="fp-input border-[var(--border)] block w-full text-sm rounded-none" placeholder="123">
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="group-with-currency" class="block text-sm font-medium mb-2 c-text">Group With Currency</label>
	<div class="flex">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm border-r-0 rounded-l-md">$</span>
		<input id="group-with-currency" type="text" class="fp-input border-[var(--border)] block w-full text-sm rounded-none" placeholder="123">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm rounded-r-md border-l-0 shrink-0">.00</span>
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<span class="block text-sm font-medium mb-2 c-text">Group With Checkbox</span>
	<div class="flex">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] rounded-l-md border-r-0">
			<input type="checkbox" id="hs-input-group-with-checkbox">
		</span>
		<input type="text" id="hs-input-with-add-on-url-checkbox" class="fp-input border-[var(--border)] block w-full text-sm rounded-l-none rounded-r-md" placeholder="Checkbox">
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<span class="block text-sm font-medium mb-2 c-text">Group With Radio</span>
	<div class="flex">
		<span class="flex items-center px-3 border border-[var(--border)] bg-[var(--surface)] rounded-l-md border-r-0">
			<input type="radio" id="hs-input-group-with-radio">
		</span>
		<input type="text" id="hs-input-with-add-on-url-radio" class="fp-input border-[var(--border)] block w-full text-sm rounded-l-none rounded-r-md" placeholder="Radio">
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<span class="block text-sm font-medium mb-2 c-text">Group With Button</span>
	<div class="flex">
		<button type="button" class="flex items-center justify-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm font-medium rounded-l-md border-r-0">Button</button>
		<input type="text" id="hs-trailing-button-add-on-multiple-add-ons" class="fp-input rounded-l-none rounded-r-md border-[var(--border)] block w-full text-sm">
	</div>
</div>
<div class="col-span-12 sm:col-span-6">
	<span class="block text-sm font-medium mb-2 c-text">Group With Buttons</span>
	<div class="flex">
		<button type="button" class="flex items-center justify-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm font-medium rounded-l-md border-r-0">Button</button>
		<button type="button" class="flex items-center justify-center px-3 border border-[var(--border)] bg-[var(--surface)] text-sm font-medium border-r-0">Button</button>
		<input type="text" id="hs-trailing-button-add-on-multiple-add-ons2" class="fp-input rounded-l-none rounded-r-md border-[var(--border)] block w-full text-sm">
	</div>
</div>`}
      >
        {ADDON_GROUPS.map((group) => (
          <div key={group.key} className="col-span-12 sm:col-span-6">
            <label htmlFor={group.id} className={GROUP_LABEL}>
              {group.label}
            </label>
            <div className="flex">
              {group.leading?.map((addon, index) => (
                <span
                  key={addon}
                  className={`${GROUP_ADDON} border-r-0 ${
                    index === 0 ? "rounded-l-md" : "shrink-0"
                  }`}
                >
                  {addon}
                </span>
              ))}
              <input
                id={group.id}
                type="text"
                className={`${GROUP_INPUT} ${
                  group.leading && group.trailing
                    ? "rounded-none"
                    : group.leading
                      ? "rounded-l-none rounded-r-md"
                      : "rounded-r-none rounded-l-md"
                }`}
                placeholder={group.placeholder}
              />
              {group.trailing && (
                <span className={`${GROUP_ADDON} rounded-r-md border-l-0 shrink-0`}>
                  {group.trailing}
                </span>
              )}
            </div>
          </div>
        ))}

        <div className="col-span-12 sm:col-span-6">
          <span className={GROUP_LABEL}>Group With Checkbox</span>
          <div className="flex">
            <span className={`${GROUP_ADDON} rounded-l-md border-r-0`}>
              <input
                type="checkbox"
                className="shrink-0 border-[var(--border)] rounded-sm c-cyan focus:ring-0 dark:checked:bg-info dark:checked:border-info"
                id="hs-input-group-with-checkbox"
              />
              <label htmlFor="hs-input-group-with-checkbox" className="sr-only">
                Checkbox
              </label>
            </span>
            <input
              type="text"
              name="hs-input-with-add-on-url-checkbox"
              id="hs-input-with-add-on-url-checkbox"
              className={`${GROUP_INPUT} rounded-l-none rounded-r-md`}
              placeholder="Checkbox"
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <span className={GROUP_LABEL}>Group With Radio</span>
          <div className="flex">
            <span className={`${GROUP_ADDON} rounded-l-md border-r-0`}>
              <input
                type="radio"
                className="shrink-0 border-[var(--border)] rounded-full text-blue-600 focus:ring-blue-500 dark:checked:bg-blue-500 dark:checked:border-blue-500"
                id="hs-input-group-with-radio"
              />
              <label htmlFor="hs-input-group-with-radio" className="sr-only">
                Radio
              </label>
            </span>
            <input
              type="text"
              name="hs-input-with-add-on-url-radio"
              id="hs-input-with-add-on-url-radio"
              className={`${GROUP_INPUT} rounded-l-none rounded-r-md`}
              placeholder="Radio"
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <span className={GROUP_LABEL}>Group With Button</span>
          <div className="flex">
            <button type="button" className={`${GROUP_BUTTON} rounded-l-md border-r-0`}>
              Button
            </button>
            <input
              type="text"
              id="hs-trailing-button-add-on-multiple-add-ons"
              name="hs-trailing-button-add-on-multiple-add-ons"
              className="fp-input rounded-l-none rounded-r-md border-[var(--border)] block w-full text-sm focus:outline-none"
              placeholder=""
            />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <span className={GROUP_LABEL}>Group With Buttons</span>
          <div className="flex">
            <button type="button" className={`${GROUP_BUTTON} rounded-l-md border-r-0`}>
              Button
            </button>
            <button type="button" className={`${GROUP_BUTTON} border-r-0`}>
              Button
            </button>
            <input
              type="text"
              id="hs-trailing-button-add-on-multiple-add-ons2"
              name="hs-trailing-button-add-on-multiple-add-ons2"
              className="fp-input rounded-l-none rounded-r-md border-[var(--border)] block w-full text-sm focus:outline-none"
              placeholder=""
            />
          </div>
        </div>
      </PreviewCard>

      <PreviewCard
        title="Checks, Radios and Switches"
        contentClassName="grid grid-cols-1 gap-6"
        code={`<div>
	<span class="block text-sm font-medium mb-2 text-dark">Default Checkboxes</span>
	<div class="inline-flex flex-wrap gap-6 mb-4">
		<div class="input-group flex items-center gap-2">
			<input type="checkbox" class="rounded-sm text-primary" id="custom-one" checked>
			<label for="custom-one">Check this custom checkbox</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="checkbox" class="rounded-sm text-primary" id="custom-two">
			<label for="custom-two">Check this custom checkbox</label>
		</div>
	</div>
</div>
<div>
	<span class="block text-sm font-medium mb-2 text-dark">Colored Checkboxes</span>
	<div class="inline-flex flex-wrap gap-6 mb-4">
		<div class="input-group flex items-center gap-2">
			<input type="checkbox" class="rounded-sm text-primary" id="primary" checked>
			<label for="primary">Primary</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="checkbox" class="rounded-sm text-warning" id="warning" checked>
			<label for="warning">Warning</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="checkbox" class="rounded-sm text-dark" id="dark" checked>
			<label for="dark">Dark</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="checkbox" class="rounded-sm text-success" id="success" checked>
			<label for="success">Success</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="checkbox" class="rounded-sm text-danger" id="danger" checked>
			<label for="danger">Danger</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="checkbox" class="rounded-sm text-info" id="info" checked>
			<label for="info">Info</label>
		</div>
	</div>
</div>
<div>
	<span class="block text-sm font-medium mb-2 text-dark">Radio</span>
	<div class="inline-flex flex-wrap gap-6 mb-4">
		<div class="input-group flex items-center gap-2">
			<input type="radio" name="custom-radio" class="rounded-full text-primary" id="radio-custom-one" checked>
			<label for="radio-custom-one">Toggle this custom radio</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="radio" name="custom-radio" class="rounded-full text-primary" id="radio-custom-two">
			<label for="radio-custom-two">Or toggle this other custom radio</label>
		</div>
	</div>
</div>
<div>
	<span class="block text-sm font-medium mb-2 text-dark">Radio</span>
	<div class="inline-flex flex-wrap gap-6 mb-4">
		<div class="input-group flex items-center gap-2">
			<input type="radio" class="rounded-full text-primary" id="radio-primary" checked>
			<label for="radio-primary">Primary</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="radio" class="rounded-full text-warning" id="radio-warning" checked>
			<label for="radio-warning">Warning</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="radio" class="rounded-full text-dark" id="radio-dark" checked>
			<label for="radio-dark">Dark</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="radio" class="rounded-full text-success" id="radio-success" checked>
			<label for="radio-success">Success</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="radio" class="rounded-full text-danger" id="radio-danger" checked>
			<label for="radio-danger">Danger</label>
		</div>
		<div class="input-group flex items-center gap-2">
			<input type="radio" class="rounded-full text-info" id="radio-info" checked>
			<label for="radio-info">Info</label>
		</div>
	</div>
</div>
<div>
	<span class="block text-sm font-medium mb-2 text-dark">Radio</span>
	<div class="inline-flex flex-wrap gap-6 mb-4">
		<div class="flex items-center gap-2">
			<label for="custom-switch-one" class="relative inline-block w-8 h-5 cursor-pointer">
				<input type="checkbox" id="custom-switch-one" class="peer sr-only" checked>
				<span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary"></span>
				<span class="absolute top-1/2 start-1 -translate-y-1/2 size-3 bg-white rounded-full peer-checked:translate-x-full"></span>
			</label>
			<label for="custom-switch-one">Default switch checkbox input</label>
		</div>
		<div class="flex items-center gap-2">
			<label for="custom-switch-two" class="relative inline-block w-8 h-5 cursor-pointer">
				<input type="checkbox" id="custom-switch-two" class="peer sr-only">
				<span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary"></span>
				<span class="absolute top-1/2 start-1 -translate-y-1/2 size-3 bg-white rounded-full peer-checked:translate-x-full"></span>
			</label>
			<label for="custom-switch-two">Default switch checkbox input</label>
		</div>
	</div>
</div>
<div>
	<span class="block text-sm font-medium mb-2 text-dark">Radio</span>
	<div class="inline-flex flex-wrap gap-6">
		<div class="flex items-center gap-2">
			<label for="primary-switch" class="relative inline-block w-8 h-5 cursor-pointer">
				<input type="checkbox" id="primary-switch" class="peer sr-only" checked>
				<span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary"></span>
				<span class="absolute top-1/2 start-1 -translate-y-1/2 size-3 bg-white rounded-full peer-checked:translate-x-full"></span>
			</label>
			<label for="primary-switch">Primary</label>
		</div>
		<!-- Warning, Dark, Success, Danger, Info switches follow the same pattern -->
	</div>
</div>`}
      >
        <div>
          <span className="block text-sm font-medium mb-2 text-dark">Default Checkboxes</span>
          <div className="inline-flex flex-wrap gap-6 mb-4">
            {["custom-one", "custom-two"].map((id, index) => (
              <div key={id} className="input-group flex items-center gap-2">
                <input
                  type="checkbox"
                  className={`${CHECK_BASE} rounded-sm text-primary focus:ring-primary checked:border-primary`}
                  id={id}
                  defaultChecked={index === 0}
                />
                <label htmlFor={id}>Check this custom checkbox</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2 text-dark">Colored Checkboxes</span>
          <div className="inline-flex flex-wrap gap-6 mb-4">
            {COLOR_TONES.map((tone) => (
              <div key={tone.id} className="input-group flex items-center gap-2">
                <input
                  type="checkbox"
                  className={`${CHECK_BASE} rounded-sm ${tone.check}`}
                  id={tone.id}
                  defaultChecked
                />
                <label htmlFor={tone.id}>{tone.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2 text-dark">Radio</span>
          <div className="inline-flex flex-wrap gap-6 mb-4">
            {[
              { id: "radio-custom-one", label: "Toggle this custom radio" },
              { id: "radio-custom-two", label: "Or toggle this other custom radio" },
            ].map((radio, index) => (
              <div key={radio.id} className="input-group flex items-center gap-2">
                <input
                  type="radio"
                  name="custom-radio"
                  className={`${CHECK_BASE} rounded-full text-primary focus:ring-primary checked:border-primary`}
                  id={radio.id}
                  defaultChecked={index === 0}
                />
                <label htmlFor={radio.id}>{radio.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2 text-dark">Radio</span>
          <div className="inline-flex flex-wrap gap-6 mb-4">
            {COLOR_TONES.map((tone) => (
              <div key={tone.id} className="input-group flex items-center gap-2">
                <input
                  type="radio"
                  className={`${CHECK_BASE} rounded-full ${tone.radio}`}
                  id={`radio-${tone.id}`}
                  defaultChecked
                />
                <label htmlFor={`radio-${tone.id}`}>{tone.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2 text-dark">Radio</span>
          <div className="inline-flex flex-wrap gap-6 mb-4">
            <Switch
              id="custom-switch-one"
              label="Default switch checkbox input"
              trackClassName={COLOR_TONES[0].switchTrack}
              defaultChecked
            />
            <Switch
              id="custom-switch-two"
              label="Default switch checkbox input"
              trackClassName={COLOR_TONES[0].switchTrack}
            />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2 text-dark">Radio</span>
          <div className="inline-flex flex-wrap gap-6">
            {COLOR_TONES.map((tone) => (
              <Switch
                key={tone.id}
                id={`${tone.id}-switch`}
                label={tone.label}
                trackClassName={tone.switchTrack}
                defaultChecked
              />
            ))}
          </div>
        </div>
      </PreviewCard>
    </div>
    {/* End grid */}
  </div>
);

export default FormElements;
