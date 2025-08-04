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

import { importUsersFromExcel } from "../action";

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

      // Validasi status
      const validRoles = [
        "super_admin",
        "admin_heavy",
        "admin_elec",
        "pengawas",
        "mekanik",
        "guest"
      ];

      if (row.role && !validRoles.includes(row.role.toLowerCase())) {
        errors.push(
          "Role harus salah satu dari: super_admin, admin_heavy, admin_elec, pengawas, mekanik, guest",
        );
      }

      // Validasi condition
      const validDepartments = ["HSE", "SCM", "PAM", "IT", "HR", "GA", "OPERATION"];
      const departmentValue = String(row.department || '').trim().toUpperCase();

      if (departmentValue && !validDepartments.includes(departmentValue)) {
        errors.push(
          `Department "${row.department}" tidak valid. Harus salah satu dari: ${validDepartments.join(', ')}`,
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
        name: "Andika",
        email: "andika@example.com",
        password: "password123",
        role: "guest",
        department: "IT",
      },
      {
        name: "Cantika",
        email: "cantika@example.com",
        password: "password321",
        role: "guest",
        department: "SCM",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Template User");

    // Add header row with field descriptions
    const headerData = [
      {
        name: "Andika",
        email: "andika@example.com",
        password: "password123",
        role: "guest",
        department: "IT",
      },
    ];

    const headerWs = XLSX.utils.json_to_sheet(headerData);
    const templateWb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(templateWb, headerWs, "Template User");
    XLSX.utils.book_append_sheet(templateWb, ws, "Contoh Data");

    XLSX.writeFile(templateWb, "template_import_user.xlsx");
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
                          <TableColumn>Nama</TableColumn>
                          <TableColumn>Email</TableColumn>
                          <TableColumn>Password</TableColumn>
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
