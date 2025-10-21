"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
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

import { importUsersFromExcel } from "../action";

import { consolePino } from "@/lib/logger";

interface ImportUserModalProps {
  onClose: () => void;
  onUsersImported?: () => void;
  users: Array<{ id: string; name: string }>;
}

interface ExcelRow {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  fid?: string; // tambahkan fid
  nik?: string; // tambahkan nik
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function ImportUserModal({
  onClose,
  onUsersImported,
  users,
}: ImportUserModalProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  const [state, formAction, isPending] = useActionState(
    importUsersFromExcel,
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
        if (onUsersImported) {
          onUsersImported();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state?.success, state?.message, onClose, onUsersImported]);

  const validateExcelData = (data: ExcelRow[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const usersMap = new Map(
      users.map((user) => [user.name.toLowerCase(), user.id]),
    );

    data.forEach((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validasi field wajib
      if (!row.name?.trim()) {
        errors.push("Nama wajib diisi");
      }
      if (!row.email?.trim()) {
        errors.push("Email wajib diisi");
      }
      if (!row.role?.trim()) {
        errors.push("Role wajib diisi");
      }
      if (!row.department?.trim()) {
        errors.push("Department wajib diisi");
      }
      // Validasi fid & nik (sesuaikan aturan: contoh fid wajib, nik numeric 16)
      if (!row.fid?.toString().trim()) {
        errors.push("FID wajib diisi");
      }
      if (!row.nik?.toString().trim()) {
        errors.push("NIK wajib diisi");
      } else if (!/^\d{10,20}$/.test(String(row.nik).trim())) {
        // contoh validasi: numeric antara 10-20 digit (ubah sesuai kebutuhan)
        warnings.push("Format NIK tidak standar (disarankan numeric, 10-20 digit)");
      }

      // Validasi status
      const validRoles = [
        "super_admin",
        "admin_heavy",
        "admin_elec",
        "pengawas",
        "mekanik",
        "guest",
      ];

      if (row.role && !validRoles.includes(row.role.toLowerCase())) {
        errors.push(
          "Role harus salah satu dari: super_admin, admin_heavy, admin_elec, pengawas, mekanik, guest",
        );
      }

      // Validasi condition
      const validDepartments = [
        "HSE",
        "SCM",
        "PAM",
        "IT",
        "HR",
        "GA",
        "OPERATION",
      ];
      const departmentValue = String(row.department || "")
        .trim()
        .toUpperCase();

      if (departmentValue && !validDepartments.includes(departmentValue)) {
        errors.push(
          `Department "${row.department}" tidak valid. Harus salah satu dari: ${validDepartments.join(", ")}`,
        );
      }

      // Validasi assignedToId (mencari berdasarkan nama user)
      if (row.password) {
        const userFound = usersMap.get(row.password.toLowerCase());

        if (!userFound) {
          warnings.push(
            `User "${row.password}" tidak ditemukan, akan di-set sebagai unassigned`,
          );
        }
      }

      results.push({
        isValid: errors.length === 0,
        errors,
        warnings,
      });
    });

    return results;
  };

  // parsing file -> setExcelData
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      if (!data) return;

      // read workbook (support binary/string)
      const wb = XLSX.read(data, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      // normalize header names (case-insensitive) and ensure fields exist
      const parsed: ExcelRow[] = raw.map((r) => ({
        name: String(r["name"] ?? r["Name"] ?? r["NAMA"] ?? ""),
        email: String(r["email"] ?? r["Email"] ?? ""),
        password: String(r["password"] ?? r["Password"] ?? ""),
        role: String(r["role"] ?? r["Role"] ?? ""),
        department: String(r["department"] ?? r["Department"] ?? ""),
        fid: String(r["fid"] ?? r["FID"] ?? r["Fid"] ?? ""),
        nik: String(r["nik"] ?? r["NIK"] ?? r["Nik"] ?? ""),
      }));

      setExcelData(parsed);
      setValidationResults(validateExcelData(parsed));
    };

    // read as binary string to support most XLSX files
    reader.readAsBinaryString(file);
  };

  // submit to server action
  const handleImportSubmit = async () => {
    if (!excelData.length) {
      alert("File belum diparsing atau data kosong");
      return;
    }

    const fd = new FormData();
    fd.append("excelData", JSON.stringify(excelData));
    fd.append("createdById", currentUserId || "");

    // PENTING: panggil formAction di dalam startTransition agar useActionState berjalan benar
    startTransition(() => {
      // `void` supaya tidak perlu menunggu di sini — isPending akan dikelola oleh useActionState
      void formAction(fd);
    });
  };

  const totalRows = excelData.length;
  const validRows = validationResults.filter((r) => r.isValid).length;
  const invalidRows = totalRows - validRows;

  const downloadTemplate = () => {
    // Fields and example rows (include fid & nik)
    const fields = ["name", "email", "password", "role", "department", "fid", "nik"];
    const exampleRows = [
      {
        name: "Andika",
        email: "andika@example.com",
        password: "password123",
        role: "guest",
        department: "IT",
        fid: "FID001",
        nik: "3201010101010001",
      },
      {
        name: "Cantika",
        email: "cantika@example.com",
        password: "password321",
        role: "guest",
        department: "SCM",
        fid: "FID002",
        nik: "3201010101010002",
      },
    ];

    // Header sheet with column names + short descriptions (human readable)
    const headerRow = [
      [
        "name",
        "email",
        "password",
        "role",
        "department",
        "fid",
        "nik",
      ],
    ];

    const headerWs = XLSX.utils.aoa_to_sheet(headerRow);
    // Example data sheet with correct column order
    const exampleWs = XLSX.utils.json_to_sheet(exampleRows, { header: fields });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, headerWs, "Template (keterangan kolom)");
    XLSX.utils.book_append_sheet(wb, exampleWs, "Contoh Data");

    XLSX.writeFile(wb, "template_import_user.xlsx");
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Import User</h2>
        <p className="text-sm text-default-600">
          Using Excel file for massal import
        </p>
      </ModalHeader>

      <ModalBody className="max-h-[70vh] overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleImportSubmit();
          }}
          className="space-y-6"
          id="importForm"
        >
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
                  onChange={handleFileChange}
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
                          <TableColumn>Nama</TableColumn>
                          <TableColumn>Email</TableColumn>
                          <TableColumn>Password</TableColumn>
                          <TableColumn>FID</TableColumn>
                          <TableColumn>NIK</TableColumn>
                          <TableColumn>Role</TableColumn>
                          <TableColumn>Department</TableColumn>
                          <TableColumn>Validasi</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {excelData.slice(0, 10).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.email}</TableCell>
                              <TableCell>{row.password}</TableCell>
                              <TableCell>{row.fid ?? "-"}</TableCell>
                              <TableCell>{row.nik ?? "-"}</TableCell>
                              <TableCell>{row.role}</TableCell>
                              <TableCell>{row.department}</TableCell>
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
          {isPending ? "Importing User..." : `Import ${validRows} User`}
        </Button>
      </ModalFooter>
    </>
  );
}
