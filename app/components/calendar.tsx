import { ReactElement, useEffect, useState } from "react";
import { SummaryActivityDecoded } from "../service";
import { ActivityTarget } from "./target";

type CalendarDisplay = "Week";

const DisplayDrawers: Record<
  CalendarDisplay,
  (date: Date, currentView: number) => ReactElement
> = {
  Week: function (date: Date, currentView: number): ReactElement {
    return <div className="w-dvw">{date.toDateString()}</div>;
  },
};
const DefaultView: Record<CalendarDisplay, (date: Date) => number> = {
  Week: (fromDate) => {
    const date = new Date(fromDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
        7,
      )
    );
  },
};
export function Calendar(props: {
  date: Date,
  setDate: (newDate: Date) => void,
  activities: SummaryActivityDecoded[], targets: ActivityTarget[],
}) {
  const { date, setDate } = props;
  const [viewType, setViewType] = useState<CalendarDisplay>("Week");
  const [view, setView] = useState<number>();
  useEffect(() => {
    setView(DefaultView[viewType](date));
  }, [viewType, date]);
  return (
    <div className="" style={{ background: "gray" }}>
      {DisplayDrawers[viewType](date, view)}
    </div>
  );
}
