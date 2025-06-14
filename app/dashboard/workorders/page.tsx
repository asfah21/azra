import { Wrench } from "lucide-react";

import WoRightButtonList from "./components/RightButtonList";
import WoCardGrid from "./components/CardGrid";
import WoMainGrid from "./components/MainGrid";
import WoUserTable from "./components/UserTable";

export default function WorkOrdersPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Wrench className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Work Orders
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <WoRightButtonList />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <WoCardGrid />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <WoMainGrid />
      </div>

      <WoUserTable />
    </div>
  );
}
