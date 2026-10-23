import React from "react";
import { Calendar, type CalendarProps } from "primereact/calendar";
import { CalendarDays } from "lucide-react";
import { TRIGGER_ICON, calendarPt } from "../common/tokens";


type CommonDatePickerProps = Omit<CalendarProps, "pt" | "unstyled"> & {
  className?: string;
  ariaLabel?: string;
};

const CommonDatePicker: React.FC<CommonDatePickerProps> = React.memo(
  ({
    className = "",
    dateFormat = "d/m/yy",
    ariaLabel = "Date picker",
    ...props
  }) => (
    <div data-component="date-picker" className={`relative ${className}`}>
      <Calendar
        unstyled
        pt={calendarPt}
        dateFormat={dateFormat}
        aria-label={ariaLabel}
        showIcon
        icon={<CalendarDays className={TRIGGER_ICON} aria-hidden="true" />}
        {...props}
      />
    </div>
  ),
);

CommonDatePicker.displayName = "CommonDatePicker";

export default CommonDatePicker;
