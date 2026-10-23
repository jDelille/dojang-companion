import { useState, type ReactNode } from "react";
import { Calendar } from "primereact/calendar";
import { CalendarDays } from "lucide-react";
import CommonDatePicker from "../../../components/common-date-picker/commonDatePicker";
import CommonTimePicker from "../../../components/common-time-picker/commonTimePicker";
import PredefinedDatePicker from "../../../components/common-date-range-picker/PredefinedDatePicker";
import { TRIGGER_ICON, calendarPt } from "../../../components/common/tokens";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/*
   Ported from tailwind/src/form-pickers.html. flatpickr is not a dependency of
   this app, so each `data-provider="flatpickr" / "timepickr"` demo is expressed
   with the equivalent PrimeReact-backed shared picker. The Calendar underneath
   is controlled, so seeded demos ("Default Date", "Preloading Time", "Inline")
   hold their value in state instead of using a DOM default.
*/

const COL = "md:col-span-6 xl:col-span-4 col-span-12";

const MIN_DATE = new Date(2026, 11, 25);
const MAX_DATE = new Date(2026, 11, 29);

const timeAt = (hours: number, minutes: number) => {
  const value = new Date();
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const PreviewCard = ({
  title,
  children,
  cardClassName = "",
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
    contentClassName="grid grid-cols-12 gap-5"
  >
    {children}
  </PreviewCodeToggle>
);

const Field = ({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) => (
  <div className={COL}>
    <label htmlFor={id} className="set-label">
      {label}
    </label>
    {children}
  </div>
);

const DatePickers = () => {
  const [basicDate, setBasicDate] = useState<Date | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [humanFriendlyDate, setHumanFriendlyDate] = useState<Date | null>(null);
  const [minMaxDate, setMinMaxDate] = useState<Date | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | null>(new Date());
  const [inlineDate, setInlineDate] = useState<Date | null>(new Date());
  const [multipleDates, setMultipleDates] = useState<Date[] | null>(null);
  const [weekNumbersDate, setWeekNumbersDate] = useState<Date | null>(null);

  return (
    <PreviewCard
      title="Flatpickr - Datepicker"
      cardClassName="mb-6"
      code={`<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="basic" class="set-label">Basic</label>
	<input type="text" id="basic" class="fp-input" data-provider="flatpickr" data-date-format="d M, Y">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="date-time" class="set-label">DateTime</label>
	<input type="text" id="date-time" class="fp-input" data-provider="flatpickr" data-enable-time="true" data-date-format="d.m.Y">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="human-friendly-dates" class="set-label">Human-Friendly Dates</label>
	<input type="text" id="human-friendly-dates" class="fp-input" data-provider="flatpickr" data-alt-input="true" data-alt-format="F j, Y">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="min-date" class="set-label">MinDate and MaxDate</label>
	<input type="text" id="min-date" class="fp-input" data-provider="flatpickr" data-min-date="2026-12-25" data-max-date="2026-12-29">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="default-date" class="set-label">Default Date</label>
	<input type="text" id="default-date" class="fp-input" data-provider="flatpickr" placeholder="Select Date">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="multiple-dates" class="set-label">Selecting Multiple Dates</label>
	<input type="text" id="multiple-dates" class="fp-input" data-provider="flatpickr" data-mode="multiple">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="range" class="set-label">Range</label>
	<input type="text" id="range" class="fp-input" data-provider="flatpickr" data-mode="range">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="inline" class="set-label">Inline</label>
	<input type="text" id="inline" class="fp-input" data-provider="flatpickr" data-inline="true">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="week-numbers" class="set-label">Week Numbers</label>
	<input type="text" id="week-numbers" class="fp-input" data-provider="flatpickr" data-week-numbers="true">
</div>`}
    >
      <Field id="basic" label="Basic">
        <CommonDatePicker
          inputId="basic"
          dateFormat="d M, yy"
          value={basicDate}
          onChange={(event) => setBasicDate((event.value as Date) ?? null)}
          ariaLabel="Basic date"
        />
      </Field>

      <Field id="date-time" label="DateTime">
        <CommonDatePicker
          inputId="date-time"
          dateFormat="dd.mm.y"
          showTime
          value={dateTime}
          onChange={(event) => setDateTime((event.value as Date) ?? null)}
          ariaLabel="Date and time"
        />
      </Field>

      <Field id="human-friendly-dates" label="Human-Friendly Dates">
        <CommonDatePicker
          inputId="human-friendly-dates"
          dateFormat="MM d, yy"
          value={humanFriendlyDate}
          onChange={(event) => setHumanFriendlyDate((event.value as Date) ?? null)}
          ariaLabel="Human friendly date"
        />
      </Field>

      <Field id="min-date" label="MinDate and MaxDate">
        <CommonDatePicker
          inputId="min-date"
          dateFormat="d M, yy"
          minDate={MIN_DATE}
          maxDate={MAX_DATE}
          viewDate={MIN_DATE}
          value={minMaxDate}
          onChange={(event) => setMinMaxDate((event.value as Date) ?? null)}
          ariaLabel="Date within limits"
        />
      </Field>

      <Field id="default-date" label="Default Date">
        <CommonDatePicker
          inputId="default-date"
          dateFormat="d M, yy"
          value={defaultDate}
          onChange={(event) => setDefaultDate((event.value as Date) ?? null)}
          placeholder="Select Date"
          ariaLabel="Default date"
        />
      </Field>

      <Field id="multiple-dates" label="Selecting Multiple Dates">
        {/* CommonDatePicker is fixed to single selection, so this one demo uses
            the underlying Calendar with the same shared `calendarPt` styling. */}
        <div data-component="date-picker" className="relative">
          <Calendar<"multiple">
            unstyled
            pt={calendarPt}
            inputId="multiple-dates"
            dateFormat="d M, yy"
            selectionMode="multiple"
            value={multipleDates}
            onChange={(event) => setMultipleDates(event.value ?? null)}
            aria-label="Multiple dates"
            showIcon
            icon={<CalendarDays className={TRIGGER_ICON} aria-hidden="true" />}
          />
        </div>
      </Field>

      <Field id="range" label="Range">
        <PredefinedDatePicker ariaLabel="Date range" />
      </Field>

      <Field id="inline" label="Inline">
        <CommonDatePicker
          inputId="inline"
          dateFormat="d M, yy"
          value={inlineDate}
          onChange={(event) => setInlineDate((event.value as Date) ?? null)}
          inline
          ariaLabel="Inline date"
        />
      </Field>

      <Field id="week-numbers" label="Week Numbers">
        <CommonDatePicker
          inputId="week-numbers"
          dateFormat="d M, yy"
          showWeek
          value={weekNumbersDate}
          onChange={(event) => setWeekNumbersDate((event.value as Date) ?? null)}
          ariaLabel="Date with week numbers"
        />
      </Field>
    </PreviewCard>
  );
};

const TimePickers = () => {
  const [basicTime, setBasicTime] = useState<Date | null>(null);
  const [time24, setTime24] = useState<Date | null>(null);
  const [limitedTime, setLimitedTime] = useState<Date | null>(null);
  const [preloaded, setPreloaded] = useState<Date | null>(timeAt(16, 45));
  const [inlineTime, setInlineTime] = useState<Date | null>(timeAt(11, 42));

  return (
    <PreviewCard
      title="Flatpickr - Timepicker"
      code={`<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="timepicker" class="set-label">Timepicker</label>
	<input type="text" id="timepicker" class="fp-input" data-provider="timepickr">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="24-hour-time-picker" class="set-label">24-hour Time Picker</label>
	<input type="text" id="24-hour-time-picker" class="fp-input" data-provider="timepickr" data-time-24hr="true">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="time-picker-w-limits" class="set-label">Time Picker w/ Limits</label>
	<input type="text" id="time-picker-w-limits" class="fp-input" data-provider="timepickr" data-time-24hr="true" data-min-time="13:00" data-max-time="16:00">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="preloading-time" class="set-label">Preloading Time</label>
	<input type="text" id="preloading-time" class="fp-input" data-provider="timepickr" data-time-24hr="true" value="16:45">
</div>
<div class="md:col-span-6 xl:col-span-4 col-span-12">
	<label for="inline2" class="set-label">Inline</label>
	<input type="text" id="inline2" class="fp-input" data-provider="timepickr" data-inline="true" placeholder="12 : 00 PM">
</div>`}
    >
      <Field id="timepicker" label="Timepicker">
        <CommonTimePicker
          inputId="timepicker"
          value={basicTime}
          onChange={(event) => setBasicTime((event.value as Date) ?? null)}
          ariaLabel="Timepicker"
        />
      </Field>

      <Field id="24-hour-time-picker" label="24-hour Time Picker">
        <CommonTimePicker
          inputId="24-hour-time-picker"
          hour24
          value={time24}
          onChange={(event) => setTime24((event.value as Date) ?? null)}
          ariaLabel="24 hour time picker"
        />
      </Field>

      <Field id="time-picker-w-limits" label="Time Picker w/ Limits">
        <CommonTimePicker
          inputId="time-picker-w-limits"
          hour24
          minDate={timeAt(13, 0)}
          maxDate={timeAt(16, 0)}
          value={limitedTime}
          onChange={(event) => setLimitedTime((event.value as Date) ?? null)}
          ariaLabel="Time picker with limits"
        />
      </Field>

      <Field id="preloading-time" label="Preloading Time">
        <CommonTimePicker
          inputId="preloading-time"
          hour24
          value={preloaded}
          onChange={(event) => setPreloaded((event.value as Date) ?? null)}
          ariaLabel="Preloaded time"
        />
      </Field>

      <Field id="inline2" label="Inline">
        <CommonTimePicker
          inputId="inline2"
          inline
          value={inlineTime}
          onChange={(event) => setInlineTime((event.value as Date) ?? null)}
          placeholder="12 : 00 PM"
          ariaLabel="Inline time picker"
        />
      </Field>
    </PreviewCard>
  );
};

const FormPickers = () => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
      <h1 className="text-xl font-black c-text mb-0">Form Pickers</h1>
    </div>

    {/* Start Grid */}
    <div className="grid grid-cols-1">
      <DatePickers />
      <TimePickers />
    </div>
    {/* End grid */}
  </div>
);

export default FormPickers;
