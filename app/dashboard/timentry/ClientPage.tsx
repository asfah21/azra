"use client";

import { useState, useEffect, useCallback } from "react";
import { Autocomplete, AutocompleteItem, Button, DatePicker, Input, Modal, ModalContent, Select, SelectItem, Spinner } from "@heroui/react";
import { CarFront, MapPin, NotebookPen, Plus, Settings2 } from "lucide-react";
import AddActivity from "./components/AddActivity";
import { getShiftInfo } from "@/lib/dateUtils";
import { LuFileText } from "react-icons/lu";

export default function TimeEntryClientPage() {
    // State for edit/delete
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; activity?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Handler for add/edit activity
  const handleAddOrEditActivity = async (entry: any) => {
    let eid = openEntryId;
    if (!eid) {
      const payload: any = { action: 'open', shiftDate: shiftInfo.shiftDate, shiftType: shiftInfo.shiftType };
      // Pastikan assetTag diambil dari unit jika belum ada di selectedAssetTag
      let assetTag = selectedAssetTag;
      if (!assetTag && selectedUnitId && units.length > 0) {
        const found = units.find(u => u.id === selectedUnitId);
        if (found) assetTag = found.assetTag;
      }
      if (assetTag) payload.assetTag = assetTag;
      const r = await fetch('/api/timentry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (r.ok) {
        const d = await r.json(); eid = d.id; setOpenEntryId(eid);
      }
    }
    if (!eid) return;
    // map entry to activity payload
    let duration = "00:00:00";
    if (entry.startTime && entry.endTime) {
      const [sh, sm] = entry.startTime.split(":").map(Number);
      const [eh, em] = entry.endTime.split(":").map(Number);
      let sec = (eh*60+em)*60 - (sh*60+sm)*60;
      if (sec < 0) sec = 0;
      const h = Math.floor(sec/3600).toString().padStart(2,"0");  
      const m = Math.floor((sec%3600)/60).toString().padStart(2,"0");
      const s = Math.floor(sec%60).toString().padStart(2,"0");
      duration = `${h}:${m}:${s}`;
    }
    const payload = {
      timeEntryId: eid,
      activity: entry.activity || entry.activityDesc?.split(' ')[0] || 'Activity',
      activityDesc: entry.activityDesc,
      location: entry.location,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration,
    };
    if (editingId) {
      // update via API
      await fetch(`/api/timentry/activity/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditingId(null);
      fetchEntries(shiftInfo);
    } else {
      await fetch('/api/timentry/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setEntries(prev => {
        const next = [...prev, { ...payload }];
        recomputeTotal(next);
        return next;
      });
      fetchEntries(shiftInfo);
    }
  };
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
  const [totalDuration, setTotalDuration] = useState<string>("00:00:00");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Fungsi untuk hitung total durasi dari entries (format HH:mm:ss), gunakan durationSec jika ada
  const recomputeTotal = useCallback((list: any[]) => {
    const secs = list.reduce((s, e) => {
      if (typeof e.durationSec === 'number' && !isNaN(e.durationSec)) {
        return s + e.durationSec;
      }
      if (e.duration && typeof e.duration === 'string') {
        const parts = e.duration.split(":").map(Number);
        if (parts.length === 3 && parts.every((n: number) => !isNaN(n))) {
          return s + parts[0]*3600 + parts[1]*60 + parts[2];
        }
      }
      return s;
    }, 0);
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    setTotalDuration(`${h}:${m}:${s}`);
  }, []);

  const fetchEntries = useCallback(async (info: ReturnType<typeof getShiftInfo>) => {
    setLoadingEntries(true);
    try {
      const res = await fetch(`/api/timentry?shiftDate=${info.shiftDate}&shiftType=${info.shiftType}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // Ensure every entry has duration
        const entriesWithDuration = (data.entries || []).map((e:any) => {
          if (e.duration && typeof e.duration === "string" && e.duration.match(/^\d{2}:\d{2}:\d{2}$/)) return e;
          // calculate duration from startTime and endTime
          if (e.startTime && e.endTime) {
            const startParts = e.startTime.split(":");
            const endParts = e.endTime.split(":");
            if (startParts.length === 2 && endParts.length === 2) {
              const sh = Number(startParts[0]), sm = Number(startParts[1]);
              const eh = Number(endParts[0]), em = Number(endParts[1]);
              if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
                let sec = (eh*60+em)*60 - (sh*60+sm)*60;
                if (sec < 0) sec = 0;
                const h = Math.floor(sec/3600).toString().padStart(2,"0");
                const m = Math.floor((sec%3600)/60).toString().padStart(2,"0");
                const s = Math.floor(sec%60).toString().padStart(2,"0");
                return { ...e, duration: `${h}:${m}:${s}` };
              }
            }
          }
          // fallback if invalid
          return { ...e, duration: "00:00:00" };
        });
        setEntries(entriesWithDuration);
        setOpenEntryId(data.openEntryId || null);
        recomputeTotal(entriesWithDuration);
      } else {
        setEntries([]);
        setOpenEntryId(null);
        recomputeTotal([]);
      }
    } catch (err) {
      setEntries([]);
      setOpenEntryId(null);
      recomputeTotal([]);
    } finally {
      setLoadingEntries(false);
    }
  }, [recomputeTotal]);

  useEffect(() => {
    const nowInfo = getShiftInfo();
    setShiftInfo(nowInfo);
    fetchEntries(nowInfo);
    const ms = nowInfo.nextBoundary.getTime() - Date.now();
    const timer = setTimeout(() => {
      const newInfo = getShiftInfo();
      setShiftInfo(newInfo);
      fetchEntries(newInfo);
    }, Math.max(1000, ms));
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
          <LuFileText className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Timesheet Form
        </h1>
      </div>

      {/* Create Timesheet Modal */}
      <Modal isDismissable={false} isOpen={showCreateModal} placement="center" size="lg" onOpenChange={(open) => { if (!open) setShowCreateModal(false); }}>
        <ModalContent>
          {(onClose) => (
            <div className="p-4">
              <h3 className="font-semibold mb-2">Create Timesheet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <Autocomplete
              isRequired
              defaultItems={units}
              label="Select Unit"
              value={project}
              isLoading={loadingUnits}
              labelPlacement="outside-top"
              placeholder={loadingUnits ? "Loading units..." : "Select | find unit"}
                selectedKey={selectedUnitId}
                style={{ outline: "none" }}
                onSelectionChange={(key: any) => {
                  const id = key?.toString() || "";
                  setSelectedUnitId(id);
                  const sel = units.find((u) => u.id === id);
                  if (sel) {
                    setProject(sel.assetTag);
                    setSelectedAssetTag(sel.assetTag);
                  }
                }}
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
             <input name="unitId" type="hidden" value={selectedUnitId || ''} />

             <Autocomplete
              isRequired
              label="Select Shift"
              labelPlacement="outside-top"
              placeholder="Select shift"
              style={{ outline: "none" }}
              value={selectedShiftType} 
              onChange={(e) => setSelectedShiftType(e.target.value as any)}
              defaultItems={[
                { key: "DAY", label: "SIANG (06:00-18:00)" },
                { key: "NIGHT", label: "MALAM (18:00-06:00)" },
              ]}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>

                {/* <div>
                  <label className="text-sm">Pilih Unit</label>
                  <select className="w-full border rounded p-2" value={selectedUnitId || ''} onChange={(e) => {
                    const id = e.target.value || null; setSelectedUnitId(id); const found = units.find(u => u.id === id); setSelectedAssetTag(found?.assetTag || null);
                  }}>
                    <option value="">-- pilih unit --</option>
                    {units.map((u:any) => <option key={u.id} value={u.id}>{u.name} ({u.assetTag})</option>)}
                  </select>
                </div>
              </div>
                    <option value="DAY">DAY (06:00-18:00)</option>
                    <option value="NIGHT">NIGHT (18:00-06:00)</option>
                  </select>
                </div> */}
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
            color="success"
            onPress={async () => {
              // Reset semua field activity agar form kosong
              setProject("");
              setDesc("");
              setTask("");
              setStartTime("");
              setEndTime("");
              setDuration("");
              setEditingId(null);
              setShowTimeLog(true);
            }}
          >
            Tambah Activity
          </Button>
        )}
        {openEntryId && entries.length > 0 && (
          <Button
            startContent={<Settings2 size={16} />}
            color="danger"
            onPress={() => setShowCloseConfirm(true)}
          >Tutup Timesheet</Button>
        )}
        <Modal isOpen={showCloseConfirm} placement="center" size="sm" onOpenChange={(open) => {
          if (!open) setShowCloseConfirm(false);
        }}>
          <ModalContent>
            {(onClose) => (
              <div className="p-4">
                <h3 className="font-semibold mb-2">Confirm Close</h3>
                <p className="text-sm text-default-500 mb-4">Apakah yakin menutup sesi timesheet ini?</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="flat" onPress={() => { onClose(); setShowCloseConfirm(false); }}>Batal</Button>
                  <Button color="danger" onPress={async () => {
                    if (openEntryId) {
                      await fetch(`/api/timentry/${openEntryId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'close' }) });
                      setOpenEntryId(null);
                      setEntries([]);
                      try { fetchEntries(shiftInfo); } catch (_) { /* ignore */ }
                    }
                    onClose();
                    setShowCloseConfirm(false);
                  }}>Tutup</Button>
                </div>
              </div>
            )}
          </ModalContent>
        </Modal>
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
              onAddLocalEntry={handleAddOrEditActivity}
            />
          )}
        </ModalContent>
      </Modal>

      {/* Entries list simple */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 text-sm text-default-500">
          <span>
            Shift: <b>{shiftInfo.shiftType === "DAY" ? "SIANG" : "MALAM"}</b>
          </span>
          <span className="font-mono">Total: <b>{totalDuration}</b></span>
        </div>
        <div className="border rounded-md p-4 divide-y">
          {loadingEntries && (
            <div className="p-4 flex items-center gap-2 text-sm">
              <Spinner size="sm" /> Loading entries...
            </div>
          )}
          {!loadingEntries && entries.length === 0 && <div>No activities</div>}
          {!loadingEntries && [...entries]
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map((e:any) => {
            return (
              <div key={e.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1">
                  <span className="pb-1 text-sm flex items-center text-default-500 truncate max-w-[200px]">
                    <MapPin size={16} className="text-red-500 shrink-0" />
                    <span className="truncate font-semibold">&nbsp;{e.location}</span>
                  </span>
                 <span className="pb-1 text-sm text-default-700 max-w-full md:max-w-[300px] flex items-start">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  {/* <NotebookPen size={14} className="text-blue-400 shrink-0 mt-[2px]" /> */}
                  <span className="ml-1 break-words whitespace-normal md:whitespace-nowrap">
                    {e.activityDesc}
                  </span>
                </span>
                <span className="pb-1 text-sm text-default-700 max-w-full md:max-w-[300px] flex items-start">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 text-green-500"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span className="text-[11px] text-default-400 font-mono ml-1">
                      {new Date(e.startTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', hour12: false })}
                      {" - "}
                      {new Date(e.endTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => {
                    setEditingId(e.id);
                    setProject(e.activity);
                    setDesc(e.activityDesc);
                    setTask(e.location || "");
                    setStartTime(e.startTime);
                    setEndTime(e.endTime);
                    setDuration(e.duration || "00:00:00");
                    setShowTimeLog(true);
                  }}>Edit</Button>
                  <Button size="sm" color="danger" variant="flat" onClick={() => {
                    setDeleteTarget({ id: e.id, activity: e.activity });
                    setShowDeleteConfirm(true);
                  }}>Delete</Button>
                </div>
              </div>
            );
          })}
        </div>
        {/* Delete confirmation modal */}
        <Modal isOpen={showDeleteConfirm} placement="center" size="sm" onOpenChange={(open) => {
          if (!open) {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }
        }}>
          <ModalContent>
            {(onClose) => (
              <div className="p-4">
                <h3 className="font-semibold mb-2">Confirm delete</h3>
                <p className="text-sm text-default-500 mb-4">Delete <b>{deleteTarget?.activity}</b> activity?</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="flat" onClick={() => { onClose(); setShowDeleteConfirm(false); setDeleteTarget(null); }}>Cancel</Button>
                  <Button color="danger" isLoading={deleting} onClick={async () => {
                    if (!deleteTarget) return;
                    setDeleting(true);
                    const id = deleteTarget.id;
                    try {
                      // delete via API
                      const res = await fetch(`/api/timentry/activity/${id}`, { method: 'DELETE' });
                      if (res.ok) {
                        fetchEntries(shiftInfo);
                      } else {
                        // fallback local delete
                        setEntries((prev) => {
                          const next = prev.filter(it => it.id !== id);
                          recomputeTotal(next);
                          return next;
                        });
                      }
                    } catch (err) {
                      // ignore
                    } finally {
                      setDeleting(false);
                      onClose();
                      setShowDeleteConfirm(false);
                      setDeleteTarget(null);
                    }
                  }}>Delete</Button>
                </div>
              </div>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}