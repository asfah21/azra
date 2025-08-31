"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Button, DatePicker } from "@heroui/react";
import { Calendar, Plus, Settings2, Shield } from "lucide-react";
import { fromDate } from "@internationalized/date";
import TimeLog from "./components/TimeLog";
import { FiClock } from "react-icons/fi";

export default function TimesheetClientPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Set default date ke UTC+8 (Singapore)
  const getSingaporeDate = () => {
    // Ambil waktu lokal, tapi tampilkan jam Singapore dengan toLocaleString
    return new Date();
  };
  const [date, setDate] = useState(getSingaporeDate());

  // Update jam setiap detik agar realtime
  useEffect(() => {
    const timer = setInterval(() => {
      setDate(getSingaporeDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  //   const [keepOpen, setKeepOpen] = useState(false);
  const [showTimeLog, setShowTimeLog] = useState(false);

  const timeku = date.toLocaleDateString("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Singapore",
});


  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
          <FiClock className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Timesheet
        </h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        {/* Left: Calendar + Date */}
        <div className="flex justify-center items-center gap-2">
          <div style={{ position: "relative" }}>
            <div className="flex flex-col gap-4">
                 <DatePicker
                   key="outside"
                   className="max-w-[321px]"
                   defaultValue={fromDate(new Date(), "Asia/Makassar") as any}
                  //  label={<span style={{ position: "fixed", width: 0, height: 0, padding: 0, margin: -1, overflow: "hidden" }}>Pilih Tanggal</span>}
                   aria-label="Pilih Tanggal"
                   onChange={value => {
                     if (value && typeof value.toDate === "function") {
                       setSelectedDate(value.toDate("Asia/Singapore"));
                     }
                   }}
                 />
                
            </div>
          </div>
        </div>

        {/* Middle: Action Buttons */}
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={() => setShowTimeLog(true)}
          >
            Add Aktivity
          </Button>
          <Button startContent={<Settings2 size={16} />} variant="flat">
            Timeline
          </Button>
        </div>

        {/* Right: Clock */}
        <div className="hidden md:block text-2xl font-mono font-bold text-center md:text-right md:ml-4">
          <span style={{ display: "inline-block", width: 100, textAlign: "right" }}>
            {date.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              // hourCycle: "h23",
              timeZone: "Asia/Singapore"
            }).replaceAll(".", ":")}
            {/* <br />
            <span style={{ fontSize: 16 }}>
              {date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Asia/Singapore"
              })}
            </span> */}
          </span>
          {/* width tetap dan rata kanan agar jam tidak goyang */}
          <style>{`
            .fixed-clock {
              display: inline-block;
              width: 100px;
              text-align: right;
            }
          `}</style>
        </div>
      </div>

      {showTimeLog && (
        <TimeLog
          date={date}
          desc={desc}
          duration={duration}
          endTime={endTime}
          project={project}
          setDesc={setDesc}
          setDuration={setDuration}
          setEndTime={setEndTime}
          setProject={setProject}
          setStartTime={setStartTime}
          setTag={setTag}
          setTask={setTask}
          startTime={startTime}
          tag={tag}
          task={task}
          onClose={() => setShowTimeLog(false)}
        />
      )}
    </div>
  );
}
