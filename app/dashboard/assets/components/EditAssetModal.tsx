"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
  Autocomplete,
  AutocompleteItem,
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
  userRole: string;
}

export function EditAssetModal({
  asset,
  users,
  onClose,
  onAssetUpdated,
  userRole,
}: EditAssetModalProps) {
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState("operational");

  const [selectedCondition, setSelectedCondition] = useState("good");

  const [selectedAssignedToId, setSelectedAssignedToId] = useState<
    string | null
  >(null);

  // React Query mutation untuk update asset
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateAsset(null, formData, userRole);
    },
    onSuccess: (data) => {
      // Invalidate cache assets agar data ter-refresh
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      // Tutup modal & callback
      setTimeout(() => {
        onClose();
        if (onAssetUpdated) onAssetUpdated();
      }, 1500);
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

  const unitStatus = [
    { key: "operational", label: "Operational" },
    { key: "maintenance", label: "Maintenance" },
    { key: "repair", label: "Repair" },
    { key: "decommissioned", label: "Decommissioned" },
  ];

  const unitConditions = [
    { key: "excellent", label: "Excellent" },
    { key: "good", label: "Good" },
    { key: "fair", label: "Fair" },
    { key: "poor", label: "Poor" },
  ];

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Edit Asset</h2>
        <p className="text-sm text-default-500">Update asset information</p>
      </ModalHeader>

      <ModalBody className="max-h-[60vh] overflow-y-auto">
        <form
          className="space-y-4"
          id="editAssetForm"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            handleSubmit(formData);
          }}
        >
          {/* Required Fields */}
          <Input
            isRequired
            defaultValue={asset.assetTag}
            label="Asset Tag"
            labelPlacement="outside-top"
            name="assetTag"
            placeholder="Enter unique asset tag"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />

          <Input
            isRequired
            defaultValue={asset.name}
            label="Unit Name"
            labelPlacement="outside-top"
            name="name"
            placeholder="Enter unit name"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />

          {/* <Select
            isRequired
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
          </Select> */}

          <Input
            isRequired
            defaultValue={asset.location}
            label="Location"
            labelPlacement="outside-top"
            name="location"
            placeholder="Enter unit location"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />

          {/* <Input
            isRequired
            labelPlacement="outside-top"
            defaultValue={asset.categoryId.toString()}
            label="Category"
            name="categoryId"
            placeholder="Enter category"
            variant="bordered"
            style={{ outline: "none" }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.outline = "none";
}}
          /> */}
          <input
            name="categoryId"
            type="hidden"
            value={asset.categoryId.toString()}
          />

          {/* <Select
            isRequired
            defaultSelectedKeys={[asset.categoryId.toString()]}
            label="Category"
            name="categoryId"
            placeholder="Select category"
            variant="bordered"
          >
            <SelectItem key="1">Alat Berat</SelectItem>
            <SelectItem key="2">Elektronik</SelectItem>
          </Select> */}

          {/* Optional Fields */}
          <Input
            defaultValue={asset.description || ""}
            label="Description"
            labelPlacement="outside-top"
            name="description"
            placeholder="Enter unit description (optional)"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Autocomplete
              defaultInputValue={asset.status || ""}
              defaultItems={unitStatus}
              label="Status"
              labelPlacement="outside-top"
              name="status"
              placeholder="Select status"
              selectedKey={selectedStatus}
              style={{ outline: "none" }}
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
              onSelectionChange={(key) => setSelectedStatus(key as string)}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
              )}
            </Autocomplete>
            <input name="status" type="hidden" value={selectedStatus} />

            {/* <Select
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
            </Select> */}

            <Autocomplete
              defaultInputValue={asset.condition || ""}
              defaultItems={unitConditions}
              label="Condition"
              labelPlacement="outside-top"
              name="condition"
              placeholder="Select condition"
              selectedKey={selectedCondition}
              style={{ outline: "none" }}
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
              onSelectionChange={(key) => setSelectedCondition(key as string)}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
              )}
            </Autocomplete>
            <input name="condition" type="hidden" value={selectedCondition} />

            {/* <Select
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
            </Select> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              defaultValue={asset.serialNumber || ""}
              label="Serial Number"
              labelPlacement="outside-top"
              name="serialNumber"
              placeholder="Enter serial number"
              style={{ outline: "none" }}
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />

            <Input
              defaultValue={asset.department || ""}
              label="Department"
              labelPlacement="outside-top"
              name="department"
              placeholder="Enter department"
              style={{ outline: "none" }}
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />
          </div>

          <Input
            defaultValue={asset.manufacturer || ""}
            label="Manufacturer"
            labelPlacement="outside-top"
            name="manufacturer"
            placeholder="Enter manufacturer"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />

          {/* <Autocomplete
            defaultItems={users.map((user) => ({
              key: user.id,
              label: user.name,
            }))}
            selectedKey={selectedAssignedToId}
            onSelectionChange={(key) => 
              setSelectedAssignedToId(typeof key === "string" ? key : "")}
            label="Assigned To"
            name="assignedToId"
            placeholder="Select user (optional)"
            labelPlacement="outside-top"
            variant="bordered"
            allowsEmptyCollection
            allowsCustomValue={false}
            style={{ outline: "none" }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.outline = "none";
}}
          >
            {(item) => (
              <AutocompleteItem key={item.key}>
                {item.label}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <input type="hidden" name="assignedToId" value={selectedAssignedToId || ""} /> */}

          <Select
            defaultSelectedKeys={asset.assignedToId ? [asset.assignedToId] : []}
            items={[{ id: "", name: "-- None --" }, ...users]}
            label="Assigned To"
            labelPlacement="outside-left"
            name="assignedToId"
            placeholder="Select user (optional)"
            style={{ outline: "none" }}
            variant="bordered"
          >
            {(item) => <SelectItem key={item.id}>{item.name}</SelectItem>}
          </Select>

          {/* <Select
            defaultSelectedKeys={asset.assignedToId ? [asset.assignedToId] : []}
            label="Assigned To"
            labelPlacement="outside-left"
            name="assignedToId"
            placeholder="Select user (optional)"
            variant="bordered"
            style={{ outline: "none" }}
          >
            {users.map((user) => (
              <SelectItem key={user.id}>{user.name}</SelectItem>
            ))}
          </Select> */}

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              defaultValue={formatDateForInput(asset.installDate)}
              label="Install Date"
              labelPlacement="outside-top"
              name="installDate"
              style={{ outline: "none" }}
              type="date"
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />

            <Input
              defaultValue={formatDateForInput(asset.warrantyExpiry)}
              label="Warranty Expiry"
              labelPlacement="outside-top"
              name="warrantyExpiry"
              style={{ outline: "none" }}
              type="date"
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              defaultValue={formatDateForInput(asset.lastMaintenance)}
              label="Last Maintenance"
              labelPlacement="outside-top"
              name="lastMaintenance"
              style={{ outline: "none" }}
              type="date"
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />

            <Input
              defaultValue={formatDateForInput(asset.nextMaintenance)}
              label="Next Maintenance"
              labelPlacement="outside-top"
              name="nextMaintenance"
              style={{ outline: "none" }}
              type="date"
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />
          </div>

          {/* Numeric Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              defaultValue={asset.assetValue?.toString() || ""}
              label="Asset Value"
              labelPlacement="outside-top"
              name="assetValue"
              placeholder="Enter asset value"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">Rp</span>
                </div>
              }
              step="0.01"
              style={{ outline: "none" }}
              type="number"
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />

            <Input
              defaultValue={asset.utilizationRate?.toString() || ""}
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">%</span>
                </div>
              }
              label="Utilization Rate"
              labelPlacement="outside-top"
              max="100"
              min="0"
              name="utilizationRate"
              placeholder="Enter utilization rate"
              style={{ outline: "none" }}
              type="number"
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
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
