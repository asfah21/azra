"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  SelectItem,
  Select,
  Input,
  Textarea,
} from "@heroui/react";

import { updateAsset } from "../action";

interface Unit {
  id: string;
  assetTag: string;
  name: string;
  description: string | null;
  categoryId: number;
  status: string;
  condition: string | null;
  serialNumber: string | null;
  location: string;
  department: string | null;
  manufacturer: string | null;
  installDate: Date | null;
  warrantyExpiry: Date | null;
  lastMaintenance: Date | null;
  nextMaintenance: Date | null;
  assetValue: number | null;
  utilizationRate: number | null;
  createdAt: Date;
  createdById: string;
  assignedToId: string | null;
}

interface EditAssetModalProps {
  asset: Unit | null;
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
  onAssetUpdated?: () => void;
}

export function EditAssetModal({
  asset,
  users,
  onClose,
  onAssetUpdated,
}: EditAssetModalProps) {
  const queryClient = useQueryClient();

  // React Query mutation untuk update asset
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateAsset(null, formData);
    },
    onSuccess: (data) => {
      // Invalidate cache assets agar data ter-refresh
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      // Tutup modal & callback
      setTimeout(() => {
        onClose();
        if (onAssetUpdated) onAssetUpdated();
      }, 500);
    },
  });

  const handleSubmit = async (formData: FormData) => {
    if (asset) {
      formData.append("id", asset.id);
      mutation.mutate(formData);
    }
  };

  // Helper function untuk format date ke YYYY-MM-DD
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";

    return new Date(date).toISOString().split("T")[0];
  };

  if (!asset) return null;

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Edit Asset</h2>
        <p className="text-sm text-default-500">Update asset information</p>
      </ModalHeader>

      <ModalBody className="max-h-[60vh] overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
          className="space-y-4"
          id="editAssetForm"
        >
          {/* Required Fields */}
          <Input
            isRequired
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            defaultValue={asset.assetTag}
            label="Asset Tag"
            name="assetTag"
            placeholder="Enter unique asset tag"
            variant="bordered"
          />

          <Select
            isRequired
            classNames={{
              label: "text-black/50 dark:text-white/90",
              trigger: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
              ],
              value: "text-black/90 dark:text-white/90",
            }}
            defaultSelectedKeys={[asset.name]}
            label="Unit Name"
            name="name"
            placeholder="Select Unit"
            variant="bordered"
          >
            <SelectItem key="Dump Truck">Dump Truck</SelectItem>
            <SelectItem key="Excavator">Excavator</SelectItem>
            <SelectItem key="Bulldozer">Bulldozer</SelectItem>
            <SelectItem key="Motor Grader">Motor Grader</SelectItem>
            <SelectItem key="Laptop">Laptop</SelectItem>
            <SelectItem key="Printer">Printer</SelectItem>
          </Select>

          <Input
            isRequired
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            defaultValue={asset.location}
            label="Location"
            name="location"
            placeholder="Enter unit location"
            variant="bordered"
          />

          <Select
            isRequired
            classNames={{
              label: "text-black/50 dark:text-white/90",
              trigger: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
              ],
              value: "text-black/90 dark:text-white/90",
            }}
            defaultSelectedKeys={[asset.categoryId.toString()]}
            label="Category"
            name="categoryId"
            placeholder="Select category"
            variant="bordered"
          >
            <SelectItem key="1">Alat Berat</SelectItem>
            <SelectItem key="2">Elektronik</SelectItem>
          </Select>

          {/* Optional Fields */}
          <Textarea
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            defaultValue={asset.description || ""}
            label="Description"
            maxRows={4}
            minRows={2}
            name="description"
            placeholder="Enter unit description (optional)"
            variant="bordered"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              classNames={{
                label: "text-black/50 dark:text-white/90",
                trigger: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                ],
                value: "text-black/90 dark:text-white/90",
              }}
              defaultSelectedKeys={[asset.status]}
              label="Status"
              name="status"
              placeholder="Select status"
              variant="bordered"
            >
              <SelectItem key="operational">Operational</SelectItem>
              <SelectItem key="maintenance">Maintenance</SelectItem>
              <SelectItem key="repair">Repair</SelectItem>
              <SelectItem key="decommissioned">Decommissioned</SelectItem>
            </Select>

            <Select
              classNames={{
                label: "text-black/50 dark:text-white/90",
                trigger: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                ],
                value: "text-black/90 dark:text-white/90",
              }}
              defaultSelectedKeys={asset.condition ? [asset.condition] : []}
              label="Condition"
              name="condition"
              placeholder="Select condition"
              variant="bordered"
            >
              <SelectItem key="excellent">Excellent</SelectItem>
              <SelectItem key="good">Good</SelectItem>
              <SelectItem key="fair">Fair</SelectItem>
              <SelectItem key="poor">Poor</SelectItem>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              defaultValue={asset.serialNumber || ""}
              label="Serial Number"
              name="serialNumber"
              placeholder="Enter serial number"
              variant="bordered"
            />

            <Input
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              defaultValue={asset.department || ""}
              label="Department"
              name="department"
              placeholder="Enter department"
              variant="bordered"
            />
          </div>

          <Input
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            defaultValue={asset.manufacturer || ""}
            label="Manufacturer"
            name="manufacturer"
            placeholder="Enter manufacturer"
            variant="bordered"
          />

          <Select
            classNames={{
              label: "text-black/50 dark:text-white/90",
              trigger: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
              ],
              value: "text-black/90 dark:text-white/90",
            }}
            defaultSelectedKeys={asset.assignedToId ? [asset.assignedToId] : []}
            label="Assigned To"
            name="assignedToId"
            placeholder="Select user (optional)"
            variant="bordered"
          >
            {users.map((user) => (
              <SelectItem key={user.id}>{user.name}</SelectItem>
            ))}
          </Select>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              defaultValue={formatDateForInput(asset.installDate)}
              label="Install Date"
              name="installDate"
              type="date"
              variant="bordered"
            />

            <Input
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              defaultValue={formatDateForInput(asset.warrantyExpiry)}
              label="Warranty Expiry"
              name="warrantyExpiry"
              type="date"
              variant="bordered"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              defaultValue={formatDateForInput(asset.lastMaintenance)}
              label="Last Maintenance"
              name="lastMaintenance"
              type="date"
              variant="bordered"
            />

            <Input
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              defaultValue={formatDateForInput(asset.nextMaintenance)}
              label="Next Maintenance"
              name="nextMaintenance"
              type="date"
              variant="bordered"
            />
          </div>

          {/* Numeric Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              defaultValue={asset.assetValue?.toString() || ""}
              label="Asset Value"
              name="assetValue"
              placeholder="Enter asset value"
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
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              defaultValue={asset.utilizationRate?.toString() || ""}
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">%</span>
                </div>
              }
              label="Utilization Rate"
              max="100"
              min="0"
              name="utilizationRate"
              placeholder="Enter utilization rate"
              type="number"
              variant="bordered"
            />
          </div>

          {/* Success Message */}
          {mutation.data && mutation.data.success && (
            <Card className="border-success-200 bg-success-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <p className="text-success-700 text-sm font-medium">
                    {mutation.data.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Error Messages */}
          {mutation.data && !mutation.data.success && (
            <Card className="border-danger-200 bg-danger-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-danger-500 rounded-full" />
                  <p className="text-danger-700 text-sm font-medium">
                    {mutation.data.message}
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
          isDisabled={mutation.isPending}
          variant="light"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          className="font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          color="primary"
          form="editAssetForm"
          isDisabled={mutation.isPending}
          isLoading={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? "Updating..." : "Update Asset"}
        </Button>
      </ModalFooter>
    </>
  );
}
