"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, DatePicker, Modal, ModalContent } from "@heroui/react";
import { Plus, Settings2 } from "lucide-react";
import AddActivity from "./components/AddActivity";
import { getShiftInfo } from "@/lib/dateUtils";

export default function TimeEntryClientPage() {
  const [date, setDate] = useState(new Date());
  const [showTimeLog, setShowTimeLog] = useState(false);
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [shiftInfo, setShiftInfo] = useState(() => getShiftInfo());
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedAssetTag, setSelectedAssetTag] = useState<string | null>(null);
  const [selectedShiftType, setSelectedShiftType] = useState<'DAY'|'NIGHT'>(() => shiftInfo.shiftType);

  const fetchEntries = useCallback(async (info: ReturnType<typeof getShiftInfo>) => {
    setLoadingEntries(true);
    try {
      const res = await fetch(`/api/timentry?shiftDate=${info.shiftDate}&shiftType=${info.shiftType}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setOpenEntryId(data.openEntryId || null);
      } else {
        setEntries([]);
        setOpenEntryId(null);
      }
    } catch {
      setEntries([]);
      setOpenEntryId(null);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

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

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Time Entry</h1>
      </div>

      {/* Create Timesheet Modal */}
      <Modal isOpen={showCreateModal} placement="center" size="lg" onOpenChange={(open) => { if (!open) setShowCreateModal(false); }}>
        <ModalContent>
          {(onClose) => (
            <div className="p-4">
              <h3 className="font-semibold mb-2">Buat Timesheet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Pilih Unit (assetTag)</label>
                  <select className="w-full border rounded p-2" value={selectedUnitId || ''} onChange={(e) => {
                    const id = e.target.value || null; setSelectedUnitId(id); const found = units.find(u => u.id === id); setSelectedAssetTag(found?.assetTag || null);
                  }}>
                    <option value="">-- pilih unit --</option>
                    {units.map((u:any) => <option key={u.id} value={u.id}>{u.name} ({u.assetTag})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm">Pilih Shift</label>
                  <select className="w-full border rounded p-2" value={selectedShiftType} onChange={(e) => setSelectedShiftType(e.target.value as any)}>
                    <option value="DAY">DAY (06:00-18:00)</option>
                    <option value="NIGHT">NIGHT (18:00-06:00)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="flat" onPress={() => { onClose(); setShowCreateModal(false); }}>Cancel</Button>
                <Button color="primary" onPress={async () => {
                  // create/open timesheet session with selected assetTag
                  const payload: any = { action: 'open', shiftDate: shiftInfo.shiftDate, shiftType: selectedShiftType };
                  if (selectedAssetTag) payload.assetTag = selectedAssetTag;
                  const res = await fetch('/api/timentry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  if (res.ok) {
                    const d = await res.json(); setOpenEntryId(d.id); fetchEntries(shiftInfo);
                    // prefill project/unit for TimeLog
                    if (selectedAssetTag) setProject(selectedAssetTag);
                    if (selectedUnitId) setSelectedUnitId(selectedUnitId);
                  }
                  onClose(); setShowCreateModal(false);
                }}>Create</Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>

      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
        {!openEntryId && (
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={async () => {
              // open create modal for unit + shift selection
              setShowCreateModal(true);
              // fetch units
              setLoadingUnits(true);
              try {
                const res = await fetch('/api/dashboard/assets');
                if (res.ok) {
                  const d = await res.json();
                  setUnits(d.allAssets || []);
                } else {
                  setUnits([]);
                }
              } catch {
                setUnits([]);
              } finally {
                setLoadingUnits(false);
              }
            }}
          >
            Buat Timesheet
          </Button>
        )}
        {openEntryId && (
          <Button
            startContent={<Plus size={16} />}
            variant="flat"
            onPress={async () => {
              // ensure project is set from open entry if empty
              if (!project && entries && openEntryId) {
                const found = entries.find((en:any) => en.id === openEntryId);
                if (found && found.assetTag) setProject(found.assetTag);
              }
              setShowTimeLog(true);
            }}
          >
            Tambah Activity
          </Button>
        )}
        {openEntryId && (
          <Button startContent={<Settings2 size={16} />} variant="flat" onPress={async () => {
            // Close timesheet if open
            if (openEntryId) {
              await fetch(`/api/timentry/${openEntryId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'close' }) });
              // clear client-side session state and list so UI reflects closed session
              setOpenEntryId(null);
              setEntries([]);
              // refresh from server in background to keep in sync
              try { fetchEntries(shiftInfo); } catch (_) { /* ignore */ }
            }
          }}>Tutup Timesheet</Button>
        )}
      </div>

  <Modal isOpen={showTimeLog} placement="center" size="4xl" isDismissable={false} onOpenChange={(open) => { if (!open) setShowTimeLog(false); }}>
        <ModalContent>
          {(onClose) => (
    <AddActivity
              date={date}
              project={project}
              setProject={setProject}
              task={task}
              setTask={setTask}
              desc={desc}
              setDesc={setDesc}
              tag={tag}
              setTag={setTag}
              duration={duration}
              setDuration={setDuration}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              onClose={() => { onClose(); setShowTimeLog(false); }}
              onAddLocalEntry={async (entry) => {
                // post activity under openEntryId; if none, open one first
                let eid = openEntryId;
                if (!eid) {
                  const r = await fetch('/api/timentry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'open', shiftDate: shiftInfo.shiftDate, shiftType: shiftInfo.shiftType }) });
                  if (r.ok) {
                    const d = await r.json(); eid = d.id; setOpenEntryId(eid);
                  }
                }
                if (!eid) return;
                // map entry to activity payload
                const payload = {
                  timeEntryId: eid,
                  activity: entry.activity || entry.activityDesc?.split(' ')[0] || 'Activity',
                  activityDesc: entry.activityDesc,
                  location: entry.location,
                  startTime: entry.startTime,
                  endTime: entry.endTime,
                };
                await fetch('/api/timentry/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                fetchEntries(shiftInfo);
              }}
    />
          )}
        </ModalContent>
      </Modal>

      {/* Entries list simple */}
      <div className="mt-6">
        <div className="text-sm text-default-500 mb-2">Shift: <b>{shiftInfo.shiftType === 'DAY' ? 'SIANG' : 'MALAM'}</b></div>
        <div className="border rounded-md p-4">
          {loadingEntries && <div>Loading...</div>}
          {!loadingEntries && entries.length === 0 && <div>No activities</div>}
          {!loadingEntries && entries.map((e:any) => (
            <div key={e.id} className="mb-2 border-b pb-2">
              <div className="font-semibold">{e.activity}</div>
              <div className="text-sm">{e.activityDesc}</div>
              <div className="text-xs">{e.startTime} - {e.endTime}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
