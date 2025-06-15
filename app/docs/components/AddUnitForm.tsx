"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";

import { createUnit } from "../action_old";

import { title } from "@/components/primitives";

export default function DocsPage() {
  const [state, formAction] = useActionState(createUnit, {
    success: false,
    message: "",
  });
  const router = useRouter();

  // Optional: Redirect on successful creation
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/units");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  const statusOptions = [
    { key: "operational", label: "Operational" },
    { key: "maintenance", label: "Maintenance" },
    { key: "breakdown", label: "Breakdown" },
    { key: "retired", label: "Retired" },
  ];

  const conditionOptions = [
    { key: "excellent", label: "Excellent" },
    { key: "good", label: "Good" },
    { key: "fair", label: "Fair" },
    { key: "poor", label: "Poor" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className={title({ class: "mb-6" })}>Tambah Unit Baru</h1>

      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md font-semibold">Form Unit Baru</p>
            <p className="text-small text-default-500">
              Isi informasi unit yang akan ditambahkan
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <form action={formAction} className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-default-700 mb-4">
                Informasi Wajib
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Asset Tag"
                  name="assetTag"
                  placeholder="Contoh: AST-001"
                  variant="bordered"
                />
                <Input
                  isRequired
                  label="Nama Unit"
                  name="name"
                  placeholder="Contoh: Laptop Dell XPS"
                  variant="bordered"
                />
                <Input
                  isRequired
                  label="Lokasi"
                  name="location"
                  placeholder="Contoh: Gedung A Lantai 2"
                  variant="bordered"
                />
                <Input
                  isRequired
                  label="Kategori ID"
                  name="categoryId"
                  placeholder="Contoh: 1"
                  type="number"
                  variant="bordered"
                />
                <Input
                  isRequired
                  className="md:col-span-2"
                  label="Dibuat Oleh ID"
                  name="createdById"
                  placeholder="Masukkan UUID user"
                  variant="bordered"
                />
              </div>
            </div>

            <Divider className="my-6" />

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-default-700 mb-4">
                Informasi Opsional
              </h3>

              <Textarea
                label="Deskripsi"
                minRows={3}
                name="description"
                placeholder="Deskripsi unit (opsional)"
                variant="bordered"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  defaultSelectedKeys={["operational"]}
                  label="Status"
                  name="status"
                  placeholder="Pilih status"
                  variant="bordered"
                >
                  {statusOptions.map((status) => (
                    <SelectItem key={status.key}>{status.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Kondisi"
                  name="condition"
                  placeholder="Pilih kondisi (opsional)"
                  variant="bordered"
                >
                  {conditionOptions.map((condition) => (
                    <SelectItem key={condition.key}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nomor Seri"
                  name="serialNumber"
                  placeholder="Contoh: SN12345678"
                  variant="bordered"
                />
                <Input
                  label="Departemen"
                  name="department"
                  placeholder="Contoh: IT"
                  variant="bordered"
                />
                <Input
                  label="Pabrikan"
                  name="manufacturer"
                  placeholder="Contoh: Dell"
                  variant="bordered"
                />
                <Input
                  label="Ditugaskan ke ID"
                  name="assignedToId"
                  placeholder="Masukkan UUID user (opsional)"
                  variant="bordered"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tanggal Instalasi"
                  name="installDate"
                  type="date"
                  variant="bordered"
                />
                <Input
                  label="Garansi Berakhir"
                  name="warrantyExpiry"
                  type="date"
                  variant="bordered"
                />
                <Input
                  label="Maintenance Terakhir"
                  name="lastMaintenance"
                  type="date"
                  variant="bordered"
                />
                <Input
                  label="Maintenance Berikutnya"
                  name="nextMaintenance"
                  type="date"
                  variant="bordered"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nilai Aset (Rp)"
                  name="assetValue"
                  placeholder="Contoh: 15000000"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">Rp</span>
                    </div>
                  }
                  step="0.01"
                  type="number"
                  variant="bordered"
                />
                <Input
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">%</span>
                    </div>
                  }
                  label="Tingkat Pemanfaatan (%)"
                  max="100"
                  min="0"
                  name="utilizationRate"
                  placeholder="Contoh: 80"
                  type="number"
                  variant="bordered"
                />
              </div>
            </div>

            <Divider className="my-6" />

            <div className="flex items-center gap-4 pt-4">
              <Button
                className="font-semibold"
                color="primary"
                size="lg"
                type="submit"
              >
                Simpan Unit
              </Button>

              {state.message && (
                <p
                  className={`text-sm font-medium ${
                    state.success ? "text-success" : "text-danger"
                  }`}
                >
                  {state.message}
                </p>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
