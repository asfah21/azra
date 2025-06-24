"use client";

import { useActionState, useEffect } from "react";
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
} from "@heroui/react";

import { createUnit } from "../action";

interface AddFormProps {
  onClose: () => void;
  onUnitAdded?: () => void;
  categories?: Array<{ id: number; name: string }>;
  users?: Array<{ id: string; name: string }>;
  currentUserId?: string;
}

export function AddForms({
  onClose,
  onUnitAdded,
  categories = [],
  users = [],
}: AddFormProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  const [state, formAction] = useActionState(createUnit, null);

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

  // Tampilkan loading jika session masih loading
  if (status === "loading") {
    return <div>Loading user session...</div>;
  }

  // Tampilkan error jika tidak ada userId
  if (!currentUserId) {
    return (
      <div className="p-4 text-danger-500">
        Error: User session not found. Please login again.
      </div>
    );
  }

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Add New Asset</h2>
      </ModalHeader>

      <ModalBody className="max-h-[60vh] overflow-y-auto">
        <form action={formAction} className="space-y-4" id="addUnitForm">
          {/* Hidden field untuk currentUserId */}
          <input name="createdById" type="hidden" value={currentUserId} />

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
            label="Asset Tag"
            name="assetTag"
            placeholder="Enter unique asset tag"
            variant="bordered"
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
            defaultSelectedKeys={["1"]}
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
            label="Assigned To"
            name="assignedToId"
            placeholder="Select user (optional)"
            variant="bordered"
          >
            {users.map((user) => (
              <SelectItem key={user.id}>
                {user.name}
              </SelectItem>
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
          variant="light"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          className="font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          color="primary"
          form="addUnitForm"
          type="submit"
        >
          Add Unit
        </Button>
      </ModalFooter>
    </>
  );
}
