import { Metadata } from "next";

import TimesheetClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Timesheet Management",
  description: "Manage timesheets and view statistics",
};

export default function TimesheetPage() {
  return <TimesheetClientPage />;
}
