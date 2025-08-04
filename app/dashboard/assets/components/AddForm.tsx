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
  SelectItem,
  Select,
  Input,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";

import { createUnit } from "../action";

interface AddFormProps {
  onClose: () => void;
  onUnitAdded?: () => void;
  categories?: Array<{ id: number; name: string }>;
  users?: Array<{ id: string; name: string }>;
}

export function AddForms({
  onClose,
  onUnitAdded,
  categories = [],
  users = [],
}: AddFormProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) =>
      createUnit(prevState, formData, session?.user?.role || "user"),
    null,
  );

  // Debugging - tampilkan userId di console
  useEffect(() => {
    console.log("Current User ID from session:", currentUserId);
  }, [currentUserId]);

  // Auto close modal jika berhasil add unit
  useEffect(() => {
    if (state?.success && state?.message) {
      const timer = setTimeout(() => {
        onClose();
        if (onUnitAdded) {
          onUnitAdded();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state?.success, state?.message, onClose, onUnitAdded]);

  const handleSubmit = async (formData: FormData) => {
    await formAction(formData);
  };

  // Tampilkan loading jika session masih loading
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-small text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Tampilkan error jika tidak ada userId
  if (!currentUserId) {
    return (
      <div className="p-4 text-danger-500">
        Error: User session not found. Please login again.
      </div>
    );
  }

  const [selectedAlatBeratName, setSelectedAlatBeratName] = useState("Dump Truck");
  const alatBeratName = [
    {
      label: "Dump Truck",
      key: "Dump Truck",
      description: "Alat berat",
    },
    {
      label: "Excavator",
      key: "Excavator",
      description: "Alat berat",
    },
    {
      label: "Bulldozer",
      key: "Bulldozer",
      description: "Alat berat",
    },
    {
      label: "Motor Grader",
      key: "Motor Grader",
      description: "Alat berat",
    },
    {
      label: "Compactor",
      key: "Compactor",
      description: "Alat berat",
    },
    {
      label: "Crane",
      key: "Crane",
      description: "Alat berat",
    },
  ];

  // const [selectedCategoryUnitId, setSelectedCategoryUnitId] = useState("1");
  // const categoryUnitId = [
  //   {label: "Alat Berat", key: "1", description: "Alat berat"},
  //   {label: "Elektronik", key: "2", description: "Elektronik"},
  // ];

  const [selectedUnitStatus, setSelectedUnitStatus] = useState("operational");
  const unitStatus = [
    {label: "Operational", key: "operational", description: "Operational"},
    {label: "Maintenance", key: "maintenance", description: "Maintenance"},
    {label: "Repair", key: "repair", description: "Repair"},
    {label: "Decommissioned", key: "decommissioned", description: "Decommissioned"},
  ];

  const [selectedUnitCondition, setSelectedUnitCondition] = useState("excellent");
  const unitCondition = [
    {label: "Excellent", key: "excellent", description: "Excellent"},
    {label: "Good", key: "good", description: "Good"},
    {label: "Fair", key: "fair", description: "Fair"},
    {label: "Poor", key: "poor", description: "Poor"},
  ];

  const [selectedAssignedToId, setSelectedAssignedToId] = useState<string | null>(null);

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Add New Asset</h2>
      </ModalHeader>

      <ModalBody className="max-h-[60vh] overflow-y-auto">
        <form action={handleSubmit} className="space-y-4" id="addUnitForm">
          {/* Hidden field untuk currentUserId */}
          <input name="createdById" type="hidden" value={currentUserId} />

          {/* Required Fields */}
          <Input
            isRequired
            labelPlacement="outside-top"
            label="Asset Tag"
            name="assetTag"
            placeholder="Enter unique asset tag"
            variant="bordered"
            style={{ outline: "none" }}
            onFocus={(e) => (e.target.style.outline = "none")}
          />

          {/* <Input
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
            label="Name"
            name="name"
            placeholder="Enter unit name"
            variant="bordered"
          /> */}

          <Autocomplete
            defaultItems={alatBeratName}
            defaultSelectedKey="Dump Truck"
            selectedKey={selectedAlatBeratName}
            label="Unit Name"
            name="name"
            labelPlacement="outside-top"
            placeholder="Search an unit name"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e) => (e.target.style.outline = "none")}
            onSelectionChange={(key) => setSelectedAlatBeratName(key as string)}
          >
            {(item) => (
              <AutocompleteItem key={item.key} variant="flat">
                {item.label}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <input type="hidden" name="name" value={selectedAlatBeratName} />

          {/* <Select
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
            defaultSelectedKeys={["Dump Truck"]}
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
            labelPlacement="outside-top"
            label="Location"
            name="location"
            placeholder="Enter unit location"
            variant="bordered"
            style={{ outline: "none" }}
            onFocus={(e) => (e.target.style.outline = "none")}
          />

          {/* <Autocomplete
            defaultItems={categoryUnitId}
            defaultSelectedKey="1"
            selectedKey={selectedCategoryUnitId}
            label="Category"
            name="categoryId"
            labelPlacement="outside-top"
            placeholder="Search an unit name"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e) => (e.target.style.outline = "none")}
            onSelectionChange={(key) => {
              setSelectedCategoryUnitId(key as string);
            }}
          >
            {(item) => (
              <AutocompleteItem key={item.key} variant="flat">
                {item.label}
              </AutocompleteItem>
            )}
          </Autocomplete> */}
          <input type="hidden" name="categoryId" value={"1"} />

          {/* <Select
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
            defaultSelectedKeys={["1"]}
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
            label="Description"
            labelPlacement="outside-top"
            name="description"
            placeholder="Enter unit description (optional)"
            variant="bordered"
            style={{ outline: "none" }}
            onFocus={(e) => (e.target.style.outline = "none")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Autocomplete
              defaultItems={unitStatus}
              defaultSelectedKey="operational"
              selectedKey={selectedUnitStatus}
              label="Status"
              name="status"
              labelPlacement="outside-top"
              placeholder="Select status"
              style={{ outline: "none" }}
              variant="bordered"
              onFocus={(e) => (e.target.style.outline = "none")}
              onSelectionChange={(key) => {
                setSelectedUnitStatus(key as string);
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.key} variant="flat">
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
            <input type="hidden" name="status" value={selectedUnitStatus} />

            {/* <Select
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
              defaultSelectedKeys={["operational"]}
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
              defaultItems={unitCondition}
              defaultSelectedKey="excellent"
              selectedKey={selectedUnitCondition}
              label="Condition"
              name="condition"
              labelPlacement="outside-top"
              placeholder="Select condition"
              style={{ outline: "none" }}
              variant="bordered"
              onFocus={(e) => (e.target.style.outline = "none")}
              onSelectionChange={(key) => {
                setSelectedUnitCondition(key as string);
              }}
            >
              {(item) => (
                <AutocompleteItem key={item.key} variant="flat">
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
            <input type="hidden" name="condition" value={selectedUnitCondition} />

            {/* <Select
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
              label="Serial Number"
              labelPlacement="outside-top"
              name="serialNumber"
              placeholder="Enter serial number"
              variant="bordered"
              style={{ outline: "none" }}
              onFocus={(e) => (e.target.style.outline = "none")}
            />

            <Input
              label="Department"
              labelPlacement="outside-top"
              name="department"
              placeholder="Enter department"
              variant="bordered"
              style={{ outline: "none" }}
              onFocus={(e) => (e.target.style.outline = "none")}
            />
          </div>

          <Input
            label="Manufacturer"
            labelPlacement="outside-top"
            name="manufacturer"
            placeholder="Enter manufacturer"
            variant="bordered"
            style={{ outline: "none" }}
            onFocus={(e) => (e.target.style.outline = "none")}
          />

          <Autocomplete
            label="Assigned To"
            name="displayOnly"
            placeholder="Select user (optional)"
            style={{ outline: "none" }}
            onFocus={(e) => (e.target.style.outline = "none")}
            variant="bordered"
            labelPlacement="outside-top"
            defaultItems={users.map((user) => ({
              key: user.id,
              label: user.name,
            }))}
            selectedKey={selectedAssignedToId}
            onSelectionChange={(key) => {
              console.log("Selected user ID:", key);
              setSelectedAssignedToId(key as string); // simpan ke state
            }}
          >
            {(item) => (
              <AutocompleteItem key={item.key} variant="flat">
                {item.label}
              </AutocompleteItem>
            )}
          </Autocomplete>

          <input type="hidden" name="assignedToId" value={selectedAssignedToId ?? ""} />


          {/* <Autocomplete
            label="Assigned To"
            name="assignedToId"
            placeholder="Select user (optional)"
            style={{ outline: "none" }}
            onFocus={(e) => (e.target.style.outline = "none")}
            variant="bordered"
            labelPlacement="outside-top"
            defaultItems={users.map((user) => ({
              key: user.id,
              label: user.name,
            }))}
            // defaultSelectedKey={""}
            onSelectionChange={(key) => {
              console.log("Selected user ID:", key);
            }}
          >
            {(item) => (
              <AutocompleteItem key={item.key} variant="flat">
                {item.label}
              </AutocompleteItem>
            )}
          </Autocomplete> */}


          {/* <Select
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
            label="Assigned To"
            name="assignedToId"
            placeholder="Select user (optional)"
            variant="bordered"
          >
            {users.map((user) => (
              <SelectItem key={user.id}>{user.name}</SelectItem>
            ))}
          </Select> */}

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              labelPlacement="outside-top"
              label="Install Date"
              name="installDate"
              type="date"
              variant="bordered"
              style={{ outline: "none" }}
              onFocus={(e) => (e.target.style.outline = "none")}
            />

            <Input
              labelPlacement="outside-top"
              label="Warranty Expiry"
              name="warrantyExpiry"
              type="date"
              variant="bordered"
              style={{ outline: "none" }}
              onFocus={(e) => (e.target.style.outline = "none")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              labelPlacement="outside-top"
              label="Last Maintenance"
              name="lastMaintenance"
              type="date"
              variant="bordered"
              style={{ outline: "none" }}
              onFocus={(e) => (e.target.style.outline = "none")}
            />

            <Input
              labelPlacement="outside-top"
              label="Next Maintenance"
              name="nextMaintenance"
              type="date"
              variant="bordered"
              style={{ outline: "none" }}
              onFocus={(e) => (e.target.style.outline = "none")}
            />
          </div>

          {/* Numeric Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              labelPlacement="outside-top"
              label="Asset Value"
              name="assetValue"
              placeholder="Enter asset value"
              style={{ outline: "none" }}
              onFocus={(e) => (e.target.style.outline = "none")}
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
              labelPlacement="outside-top"
              style={{ outline: "none" }}
              onFocus={(e) => (e.target.style.outline = "none")}
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
          {state?.success && state?.message && (
            <Card className="border-success-200 bg-success-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <p className="text-success-700 text-sm font-medium">
                    {state.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Error Messages */}
          {!state?.success && state?.message && (
            <Card className="border-danger-200 bg-danger-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-danger-500 rounded-full" />
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
          form="addUnitForm"
          isDisabled={isPending}
          isLoading={isPending}
          type="submit"
        >
          {isPending ? "Adding Asset..." : "Add Unit"}
        </Button>
      </ModalFooter>
    </>
  );
}
