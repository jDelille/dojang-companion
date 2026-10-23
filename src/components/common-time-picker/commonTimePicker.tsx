import React from "react";
import { Calendar, type CalendarProps } from "primereact/calendar";
import { Clock } from "lucide-react";
import { TRIGGER_ICON, calendarPt } from "../common/tokens";

type CommonTimePickerProps = Omit<
  CalendarProps,
  "pt" | "unstyled" | "timeOnly"
> & {
  className?: string;
  ariaLabel?: string;
  hour24?: boolean;
};

const CommonTimePicker: React.FC<CommonTimePickerProps> = React.memo(
  ({ className = "", ariaLabel = "Time picker", hour24 = false, ...props }) => (
    <div data-component="time-picker" className={`relative ${className}`}>
      <Calendar
        unstyled
        pt={calendarPt}
        timeOnly
        hourFormat={hour24 ? "24" : "12"}
        aria-label={ariaLabel}
        showIcon
        icon={<Clock className={TRIGGER_ICON} aria-hidden="true" />}
        {...props}
      />
    </div>
  ),
);

CommonTimePicker.displayName = "CommonTimePicker";

export default CommonTimePicker;
