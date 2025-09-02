"use client"
import { FiClock } from "react-icons/fi";
import { LuList } from "react-icons/lu";

export default function TimesheetListClientPage() {
    return (
        <div className="p-0 md:p-5 max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
                  <LuList className="w-6 h-6 text-primary-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Timesheet List
                </h1>
              </div>
        </div>
    )
}
