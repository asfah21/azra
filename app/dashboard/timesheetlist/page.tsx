import { Metadata } from "next";

import TimesheetListClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Timesheet Management",
  description: "Manage timesheets and view statistics",
};

export default function TimesheetPage() {
  return <TimesheetListClientPage />;
}
