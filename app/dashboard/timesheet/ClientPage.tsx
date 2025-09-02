"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, DatePicker, Spinner } from "@heroui/react";
import { Calendar, Plus, Settings2, Shield } from "lucide-react";
import { fromDate } from "@internationalized/date";
import TimeLog from "./components/TimeLog";
import { getShiftInfo } from "@/lib/dateUtils";
import { FiClock } from "react-icons/fi";
import { LuFileText } from "react-icons/lu";

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
  const [entries, setEntries] = useState<any[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [shiftInfo, setShiftInfo] = useState(() => getShiftInfo());
  const [totalDuration, setTotalDuration] = useState<string>("00:00:00");

  const recomputeTotal = useCallback((list: any[]) => {
    const secs = list.reduce((s, e) => {
      if (e.duration) {
        const [h, m, sec] = e.duration.split(":").map(Number);
        return s + h * 3600 + m * 60 + sec;
      }
      return s;
    }, 0);
    const h = Math.floor(secs / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    setTotalDuration(`${h}:${m}:${s}`);
  }, []);

  const fetchEntries = useCallback(async (info: ReturnType<typeof getShiftInfo>) => {
    setLoadingEntries(true);
    try {
      const res = await fetch(
        `/api/timesheet?shiftDate=${info.shiftDate}&shiftType=${info.shiftType}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
        recomputeTotal(data);
      } else {
        setEntries([]);
        recomputeTotal([]);
      }
    } catch {
      setEntries([]);
      recomputeTotal([]);
    } finally {
      setLoadingEntries(false);
    }
  }, [recomputeTotal]);

  // Shift boundary watcher
  useEffect(() => {
    const init = () => {
      const nowInfo = getShiftInfo();
      setShiftInfo(nowInfo);
      fetchEntries(nowInfo);
      const ms = nowInfo.nextBoundary.getTime() - Date.now();
      return setTimeout(() => {
        const newInfo = getShiftInfo();
        setShiftInfo(newInfo);
        fetchEntries(newInfo);
      }, Math.max(1000, ms));
    };
    const timer = init();
    return () => clearTimeout(timer);
  }, [fetchEntries]);

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
          <LuFileText className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Timesheet Form
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
            Add Activity
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
      onSaved={() => fetchEntries(shiftInfo)}
      onClose={() => setShowTimeLog(false)}
        />
      )}

      {/* Entries List */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 text-sm text-default-500">
          <span>
            Shift: <b>{shiftInfo.shiftType}</b> ({shiftInfo.shiftDate})
          </span>
          <span className="font-mono">Total: <b>{totalDuration}</b></span>
        </div>
        <div className="border rounded-md divide-y border-default-200 dark:border-default-100">
          {loadingEntries && (
            <div className="p-4 flex items-center gap-2 text-sm">
              <Spinner size="sm" /> Loading entries...
            </div>
          )}
          {!loadingEntries && entries.length === 0 && (
            <div className="p-4 text-sm text-default-500">No activities this shift.</div>
          )}
          {!loadingEntries &&
            entries.map((e) => (
              <div key={e.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm">
                    <span className="font-medium">{e.activity}</span>{" "}
                    <span className="text-default-500">{e.activityDesc}</span>
                  </span>
                  <span className="text-xs text-default-400">{e.location}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold font-mono">{e.duration}</div>
                  <div className="text-[11px] text-default-400 font-mono">
                    {new Date(e.startTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', hour12: false })}
                    {" - "}
                    {new Date(e.endTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
