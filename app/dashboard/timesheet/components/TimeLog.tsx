import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Button,
  Autocomplete,
  AutocompleteItem,
  DatePicker,
} from "@heroui/react";
import axios from "axios";
import {
  Clock,
  Calendar,
  Clock7,
  Hourglass,
  Save,
  CircleX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { today, fromDate } from "@internationalized/date";

import { getShiftInfo } from "@/lib/dateUtils";
import { consolePino } from "@/lib/logger";

interface TimeLogProps {
  project: string;
  setProject: (value: string) => void;
  task: string;
  setTask: (value: string) => void;
  desc: string;
  setDesc: (value: string) => void;
  tag: string;
  setTag: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  date: Date;
  onSaved?: () => void;
  onAddLocalEntry?: (entry: any) => void;
  editingId?: string | null;
  onUpdateLocalEntry?: (id: string, entry: any) => void;
  onClose: () => void;
}

interface Unit {
  id: string;
  name: string;
  assetTag: string;
}

export default function TimeLog(props: TimeLogProps) {
  const {
    project,
    setProject,
    task,
    setTask,
    desc,
    setDesc,
    tag,
    setTag,
    duration,
    setDuration,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    date,
    onClose,
    onSaved,
    onAddLocalEntry,
    editingId,
    onUpdateLocalEntry,
  } = props;
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const shiftInfo = getShiftInfo();

  // --- Handler & utilitas waktu ---
  // Tempatkan di bawah deklarasi props agar bisa akses variabel props
  // ...existing code...

  // Handler & utilitas waktu
  function formatTimeInput(val: string) {
    val = val.replace(/[^\d:]/g, "");
    if (!val) return "";
    let [h, m] = val.split(":");

    h = h ? h.padStart(2, "0") : "00";
    m = m ? m.padStart(2, "0") : "00";
    let hour = parseInt(h, 10);
    let min = parseInt(m, 10);

    if (isNaN(hour) || hour < 0 || hour > 23) hour = 0;
    if (isNaN(min) || min < 0 || min > 59) min = 0;

    return (
      hour.toString().padStart(2, "0") + ":" + min.toString().padStart(2, "0")
    );
  }

  function calcDuration(start: string, end: string) {
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let mins = eh * 60 + em - (sh * 60 + sm);

    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return (
      h.toString().padStart(2, "0") +
      ":" +
      m.toString().padStart(2, "0") +
      ":00"
    );
  }

  function addDuration(start: string, dur: string) {
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(dur)) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [dh, dm] = dur.split(":").map(Number);
    let mins = sh * 60 + sm + dh * 60 + dm;

    mins = mins % (24 * 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
  }

  function handleStartTimeChange(val: string) {
    const formatted = formatTimeInput(val);

    setStartTime(formatted);
    if (/^\d{2}:\d{2}$/.test(formatted) && /^\d{2}:\d{2}$/.test(endTime)) {
      setDuration(calcDuration(formatted, endTime));
    } else if (
      /^\d{2}:\d{2}$/.test(formatted) &&
      /^\d{2}:\d{2}$/.test(duration)
    ) {
      setEndTime(addDuration(formatted, duration));
    }
  }

  function handleEndTimeChange(val: string) {
    const formatted = formatTimeInput(val);

    setEndTime(formatted);
    if (/^\d{2}:\d{2}$/.test(startTime) && /^\d{2}:\d{2}$/.test(formatted)) {
      setDuration(calcDuration(startTime, formatted));
    }
  }

  function handleDurationChange(val: string) {
    let formatted = formatTimeInput(val);

    // Always format to HH:MM:00 for duration
    if (/^\d{2}:\d{2}$/.test(formatted)) {
      formatted = formatted + ":00";
    }
    setDuration(formatted);
    if (/^\d{2}:\d{2}:00$/.test(formatted) && /^\d{2}:\d{2}$/.test(startTime)) {
      // Remove :00 for calculation
      const dur = formatted.slice(0, 5);

      setEndTime(addDuration(startTime, dur));
    }
  }

  // Load units data on component mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get("/api/dashboard/workorders?units=true");

        setUnits(res.data);
        setLoadingUnits(false);
      } catch (error) {
        consolePino.error("Failed to load units:", error);
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, []);

  // If parent pre-fills `project` (e.g., on edit), try to select corresponding unit
  useEffect(() => {
    if (!project || units.length === 0) return;
    const found = units.find(
      (u) => u.name === project || `${u.name} (${u.assetTag})` === project,
    );

    if (found) {
      setSelectedUnitId(found.id);
    }
  }, [project, units]);

  return (
    <Card className="mb-6">
      <CardHeader className="font-semibold text-lg">
        Timesheet activity
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <Autocomplete
              isRequired
              defaultItems={units}
              isLoading={loadingUnits}
              label="Select Unit"
              labelPlacement="outside-top"
              placeholder={
                loadingUnits ? "Loading units..." : "Select | find unit"
              }
              selectedKey={selectedUnitId}
              style={{ outline: "none" }}
              value={project}
              onSelectionChange={(key: any) => {
                const id = key?.toString() || "";

                setSelectedUnitId(id);
                // set project to the selected unit's name so it is saved as activity
                const sel = units.find((u) => u.id === id);

                if (sel) {
                  setProject(sel.assetTag);
                }
              }}
              // onChange={(e) => setProject(e.target.value)}
            >
              {(item) => (
                <AutocompleteItem
                  key={item.id}
                  textValue={`${item.name} (${item.assetTag})`}
                >
                  {item.name} ({item.assetTag})
                </AutocompleteItem>
              )}
            </Autocomplete>
            <input name="unitId" type="hidden" value={selectedUnitId} />
            <Input
              isRequired
              className="my-2"
              label="Activity description"
              labelPlacement="outside-top"
              placeholder="Describe the activity"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />
            <Input
              isRequired
              label="Location"
              labelPlacement="outside-top"
              placeholder="Enter location"
              value={task}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTask(e.target.value)
              }
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />
            {/* <Input
              label="Add a tag..."
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            /> */}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 my-2">
              <Input
                isRequired
                label="Start time"
                labelPlacement="outside-top"
                placeholder="Start time"
                startContent={<Clock7 size={16} />}
                value={startTime}
                onBlur={(e) => handleStartTimeChange(e.target.value)}
                onChange={(e) => setStartTime(e.target.value)}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.target.style.outline = "none";
                }}
              />
              <Input
                isRequired
                label="End time"
                labelPlacement="outside-top"
                placeholder="End Time"
                startContent={<Clock size={16} />}
                value={endTime}
                onBlur={(e) => handleEndTimeChange(e.target.value)}
                onChange={(e) => setEndTime(e.target.value)}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.target.style.outline = "none";
                }}
              />
            </div>
            <Input
              label="Duration (automaticly)"
              labelPlacement="outside-top"
              placeholder="hh:mm:ss"
              startContent={<Hourglass size={16} />}
              value={duration}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                handleDurationChange(e.target.value)
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDuration(e.target.value)
              }
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />
            <DatePicker
              defaultValue={
                date ? (fromDate(date, "Asia/Singapore") as any) : today
              }
              label="Date (automaticly)"
              startContent={<Calendar size={16} />}
              // Use date passed from parent (ClientPage) as the default value.
              // Convert JS Date -> CalendarDate via fromDate; fallback to today()
              labelPlacement="outside"
            />
            {/* <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">Not billable</span>
              <span className="text-gray-500">Rp0,00 Cost</span>
            </div> */}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button
            color="success"
            isDisabled={!desc || !task || !startTime || !endTime || saving}
            isLoading={saving}
            startContent={<Save size={16} />}
            onPress={async () => {
              // Basic validation (redundant but keeps safety when pressing)
              if (!desc || !task || !startTime || !endTime) return;
              if (
                !/^\d{2}:\d{2}$/.test(startTime) ||
                !/^\d{2}:\d{2}$/.test(endTime)
              )
                return;
              setSaving(true);
              try {
                const payload = {
                  shiftDate: shiftInfo.shiftDate,
                  shiftType: shiftInfo.shiftType,
                  activity: project || desc.split(" ")[0] || "Activity",
                  activityDesc: desc,
                  location: task,
                  startTime,
                  endTime,
                  duration: calcDuration(startTime, endTime),
                  unitId: selectedUnitId || undefined,
                  assetTag: units.find((u) => u.id === selectedUnitId)
                    ?.assetTag,
                };

                // If editing, update parent entry
                if (editingId && onUpdateLocalEntry) {
                  onUpdateLocalEntry(editingId, payload);
                } else if (onAddLocalEntry) {
                  onAddLocalEntry(payload);
                } else {
                  // fallback: persist single entry to API
                  const res = await fetch("/api/timesheet", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  if (res.ok) {
                    onSaved && onSaved();
                  }
                }
                onClose();
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            color="danger"
            startContent={<CircleX size={16} />}
            // variant="flat"
            onPress={onClose}
          >
            Close
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
