"use client";

import { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

import { importAssetsFromExcel } from "../action";

interface ImportAssetModalProps {
  onClose: () => void;
  onAssetsImported?: () => void;
  users: Array<{ id: string; name: string }>;
}

interface ExcelRow {
  assetTag: string;
  name: string;
  description?: string;
  categoryId: number;
  status: string;
  condition?: string;
  serialNumber?: string;
  location: string;
  department?: string;
  manufacturer?: string;
  installDate?: string;
  warrantyExpiry?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  assetValue?: number;
  utilizationRate?: number;
  assignedToId?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function ImportAssetModal({
  onClose,
  onAssetsImported,
  users,
}: ImportAssetModalProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  const [state, formAction, isPending] = useActionState(
    importAssetsFromExcel,
    null,
  );
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Auto close modal jika berhasil import
  useEffect(() => {
    if (state?.success && state?.message) {
      const timer = setTimeout(() => {
        onClose();
        if (onAssetsImported) {
          onAssetsImported();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state?.success, state?.message, onClose, onAssetsImported]);

  const validateExcelData = (data: ExcelRow[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const usersMap = new Map(
      users.map((user) => [user.name.toLowerCase(), user.id]),
    );

    data.forEach((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validasi field wajib
      if (!row.assetTag?.trim()) {
        errors.push("Asset Tag wajib diisi");
      }
      if (!row.name?.trim()) {
        errors.push("Nama Asset wajib diisi");
      }
      if (!row.location?.trim()) {
        errors.push("Lokasi wajib diisi");
      }
      if (!row.categoryId || ![1, 2].includes(row.categoryId)) {
        errors.push("Category ID harus 1 (Alat Berat) atau 2 (Elektronik)");
      }

      // Validasi status
      const validStatuses = [
        "operational",
        "maintenance",
        "repair",
        "decommissioned",
      ];

      if (row.status && !validStatuses.includes(row.status.toLowerCase())) {
        errors.push(
          "Status harus salah satu dari: operational, maintenance, repair, decommissioned",
        );
      }

      // Validasi condition
      const validConditions = ["excellent", "good", "fair", "poor"];

      if (
        row.condition &&
        !validConditions.includes(row.condition.toLowerCase())
      ) {
        errors.push(
          "Condition harus salah satu dari: excellent, good, fair, poor",
        );
      }

      // Validasi assignedToId (mencari berdasarkan nama user)
      if (row.assignedToId) {
        const userFound = usersMap.get(row.assignedToId.toLowerCase());

        if (!userFound) {
          warnings.push(
            `User "${row.assignedToId}" tidak ditemukan, akan di-set sebagai unassigned`,
          );
        }
      }

      // Validasi tanggal
      if (row.installDate && isNaN(Date.parse(row.installDate))) {
        errors.push("Format tanggal instalasi tidak valid");
      }
      if (row.warrantyExpiry && isNaN(Date.parse(row.warrantyExpiry))) {
        errors.push("Format tanggal garansi tidak valid");
      }
      if (row.lastMaintenance && isNaN(Date.parse(row.lastMaintenance))) {
        errors.push("Format tanggal maintenance terakhir tidak valid");
      }
      if (row.nextMaintenance && isNaN(Date.parse(row.nextMaintenance))) {
        errors.push("Format tanggal maintenance berikutnya tidak valid");
      }

      // Validasi nilai numerik
      if (row.assetValue && (isNaN(row.assetValue) || row.assetValue < 0)) {
        errors.push("Nilai asset harus berupa angka positif");
      }
      if (
        row.utilizationRate &&
        (isNaN(row.utilizationRate) ||
          row.utilizationRate < 0 ||
          row.utilizationRate > 100)
      ) {
        errors.push("Tingkat pemanfaatan harus antara 0-100");
      }

      results.push({
        isValid: errors.length === 0,
        errors,
        warnings,
      });
    });

    return results;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadedFileName(file.name);
    setIsValidating(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

        setExcelData(jsonData);
        const validationResults = validateExcelData(jsonData);

        setValidationResults(validationResults);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        setExcelData([]);
        setValidationResults([]);
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (formData: FormData) => {
    if (excelData.length === 0) {
      return;
    }

    // Tambahkan data Excel ke FormData
    formData.append("excelData", JSON.stringify(excelData));
    formData.append("createdById", currentUserId);

    await formAction(formData);
  };

  const totalRows = excelData.length;
  const validRows = validationResults.filter((r) => r.isValid).length;
  const invalidRows = totalRows - validRows;

  const downloadTemplate = () => {
    const templateData = [
      {
        assetTag: "DT.02.100",
        name: "Dump Truck",
        description: "Dump truck untuk pengangkutan material",
        categoryId: 1,
        status: "operational",
        condition: "good",
        serialNumber: "SN12345678",
        location: "Site Wolo",
        department: "SCM",
        manufacturer: "Komatsu",
        installDate: "2025-01-15",
        warrantyExpiry: "2027-01-15",
        lastMaintenance: "2025-06-01",
        nextMaintenance: "2025-12-01",
        assetValue: 500000000,
        utilizationRate: 85,
        assignedToId: "Azvan",
      },
      {
        assetTag: "ITLT-052",
        name: "Laptop",
        description: "Laptop untuk administrasi",
        categoryId: 2,
        status: "operational",
        condition: "excellent",
        serialNumber: "SN87654321",
        location: "Office Site Wolo",
        department: "IT",
        manufacturer: "Lenovo",
        installDate: "2025-03-01",
        warrantyExpiry: "2026-03-01",
        lastMaintenance: "",
        nextMaintenance: "",
        assetValue: 7500000,
        utilizationRate: 80,
        assignedToId: "Muh. Al Asfahani",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Template Asset");

    // Add header row with field descriptions
    const headerData = [
      {
        assetTag: "DT.02.100",
        name: "Dump Truck",
        description: "Deskripsi (Opsional)",
        categoryId: "1",
        status: "operational",
        condition: "excellent",
        serialNumber: "SN12345678",
        location: "Site Wolo",
        department: "Operation",
        manufacturer: "Mitshubishi Fuso",
        installDate: "2025-01-15",
        warrantyExpiry: "2027-01-15",
        lastMaintenance: "2025-06-01",
        nextMaintenance: "2025-12-01",
        assetValue: 500000000,
        utilizationRate: 85,
        assignedToId: "",
      },
    ];

    const headerWs = XLSX.utils.json_to_sheet(headerData);
    const templateWb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(templateWb, headerWs, "Template Asset");
    XLSX.utils.book_append_sheet(templateWb, ws, "Contoh Data");

    XLSX.writeFile(templateWb, "template_import_asset.xlsx");
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Import Assets</h2>
        <p className="text-sm text-default-600">
          Using Excel file for massal import
        </p>
      </ModalHeader>

      <ModalBody className="max-h-[70vh] overflow-y-auto">
        <form action={handleSubmit} className="space-y-6" id="importForm">
          {/* Template Download Section */}
          <Card className="border-primary-200 bg-primary-50">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-primary-800">
                    Download Template Excel
                  </h3>
                  <p className="text-xs text-primary-600 mt-1">
                    Download template for correct data format
                  </p>
                </div>
                <Button
                  color="primary"
                  size="sm"
                  variant="flat"
                  onPress={downloadTemplate}
                >
                  Template
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* File Upload Section */}
          <Card className="border-2 border-dashed border-default-300">
            <CardBody className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-primary-50 rounded-full">
                  <FileSpreadsheet className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium">Upload Excel</h3>
                  <p className="text-sm text-default-600">
                    Drag and drop Excel file or click to select file
                  </p>
                </div>
                <input
                  accept=".xlsx,.xls"
                  className="hidden"
                  id="excelFile"
                  type="file"
                  onChange={handleFileUpload}
                />
                <Button
                  as="label"
                  color="primary"
                  htmlFor="excelFile"
                  startContent={<Upload className="w-4 h-4" />}
                  variant="flat"
                >
                  Select Excel File
                </Button>
                {uploadedFileName && (
                  <p className="text-sm text-success-600">
                    File selected: {uploadedFileName}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Validation Results */}
          {totalRows > 0 && (
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Hasil Validasi</h3>
                  <div className="flex gap-2">
                    <Chip color="success" size="sm" variant="flat">
                      {validRows} Valid
                    </Chip>
                    {invalidRows > 0 && (
                      <Chip color="danger" size="sm" variant="flat">
                        {invalidRows} Error
                      </Chip>
                    )}
                  </div>
                </div>

                {isValidating ? (
                  <div className="flex items-center gap-2">
                    <Progress
                      isIndeterminate
                      aria-label="Loading..."
                      size="sm"
                    />
                    <span className="text-sm">Memvalidasi data...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview Table */}
                    <div className="max-h-60 overflow-y-auto">
                      <Table aria-label="Preview data Excel">
                        <TableHeader>
                          <TableColumn>Asset Tag</TableColumn>
                          <TableColumn>Nama</TableColumn>
                          <TableColumn>Lokasi</TableColumn>
                          <TableColumn>Status</TableColumn>
                          <TableColumn>Validasi</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {excelData.slice(0, 10).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.assetTag}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.location}</TableCell>
                              <TableCell>{row.status}</TableCell>
                              <TableCell>
                                {validationResults[index]?.isValid ? (
                                  <CheckCircle className="w-4 h-4 text-success-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-danger-500" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {excelData.length > 10 && (
                        <p className="text-xs text-default-500 mt-2">
                          Menampilkan 10 baris pertama dari {excelData.length}{" "}
                          total baris
                        </p>
                      )}
                    </div>

                    {/* Error Details */}
                    {invalidRows > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-danger-600">
                          Detail Error:
                        </h4>
                        {validationResults.map(
                          (result, index) =>
                            result.errors.length > 0 && (
                              <div
                                key={index}
                                className="text-xs bg-danger-50 p-2 rounded"
                              >
                                <p className="font-medium">
                                  Baris {index + 1}:
                                </p>
                                <ul className="list-disc list-inside">
                                  {result.errors.map((error, errorIndex) => (
                                    <li key={errorIndex}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            ),
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Success/Error Messages */}
          {state?.success && state?.message && (
            <Card className="border-success-200 bg-success-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <p className="text-success-700 text-sm font-medium">
                    {state.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {!state?.success && state?.message && (
            <Card className="border-danger-200 bg-danger-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-danger-500" />
                  <p className="text-danger-700 text-sm font-medium">
                    {state.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </form>
      </ModalBody>

      <ModalFooter>
        <Button
          className="font-medium"
          color="danger"
          isDisabled={isPending}
          variant="light"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          className="font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          color="primary"
          form="importForm"
          isDisabled={isPending || totalRows === 0 || invalidRows > 0}
          isLoading={isPending}
          type="submit"
        >
          {isPending ? "Mengimpor Assets..." : `Import ${validRows} Assets`}
        </Button>
      </ModalFooter>
    </>
  );
}
