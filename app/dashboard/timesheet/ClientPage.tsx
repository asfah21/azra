"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  DatePicker,
  Spinner,
  Modal,
  ModalContent,
} from "@heroui/react";
import { CarFront, MapPin, NotebookPen, Plus, Settings2 } from "lucide-react";
import { fromDate } from "@internationalized/date";
import { LuFileText } from "react-icons/lu";

import TimeLog from "./components/TimeLog";

import { getShiftInfo } from "@/lib/dateUtils";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    activity?: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const fetchEntries = useCallback(
    async (info: ReturnType<typeof getShiftInfo>) => {
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
    },
    [recomputeTotal],
  );

  // Shift boundary watcher
  useEffect(() => {
    const init = () => {
      const nowInfo = getShiftInfo();

      setShiftInfo(nowInfo);
      fetchEntries(nowInfo);
      const ms = nowInfo.nextBoundary.getTime() - Date.now();

      return setTimeout(
        () => {
          const newInfo = getShiftInfo();

          setShiftInfo(newInfo);
          fetchEntries(newInfo);
        },
        Math.max(1000, ms),
      );
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
                onChange={(value) => {
                  if (value && typeof value.toDate === "function") {
                    setSelectedDate(value.toDate("Asia/Singapore"));
                  }
                }}
                defaultValue={fromDate(new Date(), "Asia/Makassar") as any}
                //  label={<span style={{ position: "fixed", width: 0, height: 0, padding: 0, margin: -1, overflow: "hidden" }}>Pilih Tanggal</span>}
                aria-label="Pilih Tanggal"
              />
            </div>
          </div>
        </div>

        {/* Middle: Action Buttons */}
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={() => {
              // Reset form fields for new activity (only when adding, not editing)
              setEditingId(null);
              setProject("");
              setDesc("");
              setTask("");
              setTag("");
              setStartTime("");
              setEndTime("");
              setDuration("");
              setShowTimeLog(true);
            }}
          >
            Add Activity
          </Button>
          <Button startContent={<Settings2 size={16} />} variant="flat">
            Timeline
          </Button>
        </div>

        {/* Right: Clock */}
        <div className="hidden md:block text-2xl font-mono font-bold text-center md:text-right md:ml-4">
          <span
            style={{ display: "inline-block", width: 100, textAlign: "right" }}
          >
            {date
              .toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                // hourCycle: "h23",
                timeZone: "Asia/Singapore",
              })
              .replaceAll(".", ":")}
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

      <Modal
        isDismissable={false}
        isOpen={showTimeLog}
        placement="center"
        scrollBehavior="inside"
        size="4xl"
        onOpenChange={(open) => {
          if (!open) {
            setShowTimeLog(false);
            setEditingId(null);
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <TimeLog
              date={date}
              desc={desc}
              duration={duration}
              editingId={editingId}
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
              onAddLocalEntry={async (entry) => {
                // persist to server
                try {
                  const payload = {
                    shiftDate: shiftInfo.shiftDate,
                    shiftType: shiftInfo.shiftType,
                    activity:
                      entry.activity ||
                      entry.activityDesc?.split(" ")[0] ||
                      "Activity",
                    activityDesc: entry.activityDesc,
                    location: entry.location,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                  };
                  const res = await fetch("/api/timesheet", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  if (res.ok) {
                    const created = await res.json();

                    // append created entry to list (include assetTag if returned)
                    setEntries((prev) => {
                      const next = [...prev, created];

                      recomputeTotal(next);

                      return next;
                    });
                    // reload from server to ensure persisted entries are in sync
                    fetchEntries(shiftInfo);
                  } else {
                    // fallback to local entry if server fails
                    const tempId = `temp-${Date.now()}`;
                    const [h, m, s] = (entry.duration || "00:00:00")
                      .split(":")
                      .map(Number);
                    const durationSec =
                      (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
                    const e = {
                      id: tempId,
                      userId: "local",
                      activity: entry.activity,
                      activityDesc: entry.activityDesc,
                      location: entry.location,
                      startTime: new Date(
                        shiftInfo.shiftDate +
                          "T" +
                          entry.startTime +
                          ":00.000Z",
                      ).toISOString(),
                      endTime: new Date(
                        shiftInfo.shiftDate + "T" + entry.endTime + ":00.000Z",
                      ).toISOString(),
                      duration: entry.duration,
                      durationSec,
                      unitId: entry.unitId || undefined,
                      assetTag: entry.assetTag || undefined,
                    };

                    setEntries((prev) => {
                      const next = [...prev, e];

                      recomputeTotal(next);

                      return next;
                    });
                  }
                } catch (err) {
                  // create local fallback
                  const tempId = `temp-${Date.now()}`;
                  const [h, m, s] = (entry.duration || "00:00:00")
                    .split(":")
                    .map(Number);
                  const durationSec =
                    (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
                  const e = {
                    id: tempId,
                    userId: "local",
                    activity: entry.activity,
                    activityDesc: entry.activityDesc,
                    location: entry.location,
                    startTime: new Date(
                      shiftInfo.shiftDate + "T" + entry.startTime + ":00.000Z",
                    ).toISOString(),
                    endTime: new Date(
                      shiftInfo.shiftDate + "T" + entry.endTime + ":00.000Z",
                    ).toISOString(),
                    duration: entry.duration,
                    durationSec,
                  };

                  setEntries((prev) => {
                    const next = [...prev, e];

                    recomputeTotal(next);

                    return next;
                  });
                }
              }}
              onClose={() => {
                // close both modal and internal state
                onClose();
                setShowTimeLog(false);
                setEditingId(null);
              }}
              onSaved={() => fetchEntries(shiftInfo)}
              onUpdateLocalEntry={async (id, entry) => {
                try {
                  // if id starts with temp-, skip server update and just update local
                  if (id.startsWith("temp-")) {
                    setEntries((prev) => {
                      const next = prev.map((it) => {
                        if (it.id !== id) return it;
                        const [h, m, s] = (entry.duration || "00:00:00")
                          .split(":")
                          .map(Number);
                        const durationSec =
                          (h || 0) * 3600 + (m || 0) * 60 + (s || 0);

                        return {
                          ...it,
                          activity: entry.activity,
                          activityDesc: entry.activityDesc,
                          location: entry.location,
                          startTime: new Date(
                            shiftInfo.shiftDate +
                              "T" +
                              entry.startTime +
                              ":00.000Z",
                          ).toISOString(),
                          endTime: new Date(
                            shiftInfo.shiftDate +
                              "T" +
                              entry.endTime +
                              ":00.000Z",
                          ).toISOString(),
                          duration: entry.duration,
                          durationSec,
                        };
                      });

                      recomputeTotal(next);

                      return next;
                    });
                  } else {
                    const payload = {
                      activity: entry.activity,
                      activityDesc: entry.activityDesc,
                      location: entry.location,
                      startTime: entry.startTime,
                      endTime: entry.endTime,
                    };
                    const res = await fetch(`/api/timesheet/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });

                    if (res.ok) {
                      const updated = await res.json();

                      setEntries((prev) => {
                        const next = prev.map((it) =>
                          it.id === id
                            ? { ...updated, assetTag: updated.assetTag }
                            : it,
                        );

                        recomputeTotal(next);

                        return next;
                      });
                      // reload entries from server to ensure persisted changes remain after refresh
                      fetchEntries(shiftInfo);
                    }
                  }
                } catch (err) {
                  // fallback to local update
                  setEntries((prev) => {
                    const next = prev.map((it) => {
                      if (it.id !== id) return it;
                      const [h, m, s] = (entry.duration || "00:00:00")
                        .split(":")
                        .map(Number);
                      const durationSec =
                        (h || 0) * 3600 + (m || 0) * 60 + (s || 0);

                      return {
                        ...it,
                        activity: entry.activity,
                        activityDesc: entry.activityDesc,
                        location: entry.location,
                        startTime: new Date(
                          shiftInfo.shiftDate +
                            "T" +
                            entry.startTime +
                            ":00.000Z",
                        ).toISOString(),
                        endTime: new Date(
                          shiftInfo.shiftDate +
                            "T" +
                            entry.endTime +
                            ":00.000Z",
                        ).toISOString(),
                        duration: entry.duration,
                        durationSec,
                        unitId: entry.unitId || it.unitId,
                        assetTag: entry.assetTag || it.assetTag,
                      };
                    });

                    recomputeTotal(next);

                    return next;
                  });
                }
                setEditingId(null);
              }}
            />
          )}
        </ModalContent>
      </Modal>

      {/* Entries List */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 text-sm text-default-500">
          <span>
            {/* Shift: <b>{shiftInfo.shiftType}</b> ({shiftInfo.shiftDate}) */}
            Shift: <b>{shiftInfo.shiftType === "DAY" ? "SIANG" : "MALAM"}</b>
          </span>
          <span className="font-mono">
            Total: <b>{totalDuration}</b>
          </span>
        </div>
        <div className="border rounded-md divide-y border-default-200 dark:border-default-100">
          {loadingEntries && (
            <div className="p-4 flex items-center gap-2 text-sm">
              <Spinner size="sm" /> Loading entries...
            </div>
          )}
          {!loadingEntries && entries.length === 0 && (
            <div className="p-4 text-sm text-default-500">No activities</div>
          )}
          {!loadingEntries &&
            entries.map((e) => (
              <div
                key={e.id}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between md:flex-wrap gap-2 border-none"
              >
                <div className="border border-default-200 dark:border-default-100 rounded-md p-2 flex flex-col md:flex-row md:items-center md:justify-between md:flex-wrap gap-2 w-full">
                  <div className="flex flex-col md:flex-1 md:order-1">
                    <span className="text-sm">
                      <span className="pb-2 flex items-center text-default-500 truncate max-w-[200px]">
                        <CarFront
                          className="text-yellow-500 shrink-0"
                          size={18}
                        />
                        <span className="font-medium">{e.activity} </span>&nbsp;
                        <MapPin className="text-red-500 shrink-0" size={16} />
                        <span className="truncate">{e.location}</span>
                      </span>
                    </span>
                    <span className="text-xs text-default-700 truncate max-w-[300px] flex items-center">
                      <NotebookPen
                        className="text-default-700 shrink-0"
                        size={14}
                      />
                      <span className="ml-1"> {e.activityDesc}</span>
                    </span>
                  </div>
                  <div className="text-right md:order-2 md:w-auto">
                    <div className="text-sm font-semibold font-mono">
                      {e.duration}
                    </div>
                    <div className="text-[11px] text-default-400 font-mono">
                      {new Date(e.startTime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                      {" - "}
                      {new Date(e.endTime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 md:ml-0 md:w-full md:justify-end md:order-3 md:mt-3">
                    <Button
                      size="sm"
                      onPress={() => {
                        // open modal for editing and prefill fields
                        setEditingId(e.id);
                        setProject(e.activity);
                        setDesc(e.activityDesc);
                        setTask(e.location || "");
                        // convert ISO times back to HH:MM
                        const s = new Date(e.startTime);
                        const en = new Date(e.endTime);
                        const pad = (n: number) =>
                          n.toString().padStart(2, "0");

                        setStartTime(
                          `${pad(s.getHours())}:${pad(s.getMinutes())}`,
                        );
                        setEndTime(
                          `${pad(en.getHours())}:${pad(en.getMinutes())}`,
                        );
                        setDuration(e.duration || "00:00:00");
                        setShowTimeLog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        // open delete confirmation modal
                        setDeleteTarget({ id: e.id, activity: e.activity });
                        setShowDeleteConfirm(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteConfirm}
        placement="center"
        size="sm"
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <div className="p-4">
              <h3 className="font-semibold mb-2">Confirm delete</h3>
              <p className="text-sm text-default-500 mb-4">
                Delete <b>{deleteTarget?.activity}</b> activity?
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="flat"
                  onPress={() => {
                    onClose();
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={deleting}
                  onPress={async () => {
                    if (!deleteTarget) return;
                    setDeleting(true);
                    const id = deleteTarget.id;

                    try {
                      if (id.startsWith("temp-")) {
                        setEntries((prev) => {
                          const next = prev.filter((it) => it.id !== id);

                          recomputeTotal(next);

                          return next;
                        });
                      } else {
                        const res = await fetch(`/api/timesheet/${id}`, {
                          method: "DELETE",
                        });

                        if (res.ok) {
                          fetchEntries(shiftInfo);
                        }
                      }
                    } catch (err) {
                      // ignore
                    } finally {
                      setDeleting(false);
                      onClose();
                      setShowDeleteConfirm(false);
                      setDeleteTarget(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
