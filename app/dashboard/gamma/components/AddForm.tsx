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
  Chip,
} from "@heroui/react";

import { createBreakdown, getUnits, getNextBreakdownNumber } from "../action";

interface AddWoFormProps {
  onClose: () => void;
  onBreakdownAdded?: () => void;
}

interface Unit {
  id: string;
  name: string;
  assetTag: string;
}

interface Component {
  component: string;
  subcomponent: string;
}

export function AddWoForm({ onClose, onBreakdownAdded }: AddWoFormProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";
  const userRole = session?.user?.role || "";

  const [components, setComponents] = useState<Component[]>([]);
  const [componentInput, setComponentInput] = useState("");
  const [subcomponentInput, setSubcomponentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [loadingUnits, setLoadingUnits] = useState(true);

  const [state, formAction] = useActionState(createBreakdown, null);

  const [breakdownNumber, setBreakdownNumber] = useState("");

  // Load units data on component mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const unitsData = await getUnits();

        setUnits(unitsData);
        setLoadingUnits(false);
      } catch (error) {
        console.error("Failed to load units:", error);
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, []);

  // Auto close modal jika berhasil add breakdown
  useEffect(() => {
    if (state?.success && state?.message) {
      const timer = setTimeout(() => {
        onClose();
        if (onBreakdownAdded) {
          onBreakdownAdded();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state?.success, state?.message, onClose, onBreakdownAdded]);

  useEffect(() => {
    async function fetchBreakdownNumber() {
      const number = await getNextBreakdownNumber(userRole);

      setBreakdownNumber(number);
    }
    if (userRole) {
      fetchBreakdownNumber();
    }
  }, [userRole]);

  const addComponent = () => {
    if (componentInput.trim() && subcomponentInput.trim()) {
      setComponents([
        ...components,
        {
          component: componentInput,
          subcomponent: subcomponentInput,
        },
      ]);
      setComponentInput("");
      setSubcomponentInput("");
    }
  };

  const removeComponent = (index: number) => {
    const newComponents = [...components];

    newComponents.splice(index, 1);
    setComponents(newComponents);
  };

  // Handle form submission dengan loading state
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await formAction(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h2 className="text-xl font-semibold">Report New Breakdown</h2>
      </ModalHeader>

      <ModalBody className="max-h-[60vh] overflow-y-auto">
        <form action={handleSubmit} className="space-y-4" id="addBreakdownForm">
          {/* Hidden fields */}
          <input name="reportedById" type="hidden" value={currentUserId} />
          {components.map((comp, index) => (
            <div key={`component-group-${index}`}>
              <input
                name={`components[${index}][component]`}
                type="hidden"
                value={comp.component}
              />
              <input
                name={`components[${index}][subcomponent]`}
                type="hidden"
                value={comp.subcomponent}
              />
            </div>
          ))}

          <Input
            isReadOnly
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
            label="Breakdown Number"
            name="breakdownNumber"
            type="text"
            value={breakdownNumber}
            variant="bordered"
          />

          {/* Required Fields */}
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
            label="Unit"
            name="unitId"
            placeholder={loadingUnits ? "Loading units..." : "Select unit"}
            renderValue={(items) => {
              return items.map((item) => {
                const unit = units.find((u) => u.id === item.key);

                return unit ? `${unit.name} (${unit.assetTag})` : "";
              });
            }}
            selectedKeys={selectedUnitId ? [selectedUnitId] : []}
            variant="bordered"
            onSelectionChange={(keys) => {
              const keyArray = Array.from(keys);

              setSelectedUnitId(keyArray[0]?.toString() || "");
            }}
          >
            {units.map((unit) => (
              <SelectItem key={unit.id}>
                {unit.name} ({unit.assetTag})
              </SelectItem>
            ))}
          </Select>

          <Textarea
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
            label="Description"
            name="description"
            placeholder="Describe the breakdown in detail"
            variant="bordered"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              defaultValue={new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16)}
              label="Breakdown Time"
              name="breakdownTime"
              type="datetime-local"
              variant="bordered"

              // defaultValue={new Date().toISOString().slice(0, 16)}
              // label="Breakdown Time"
              // name="breakdownTime"
              // type="datetime-local"
              // variant="bordered"
            />

            {/* Hidden priority input with default value "medium" */}
            <input name="priority" type="hidden" value="medium" />

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
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">hours</span>
                </div>
              }
              label="Working Hours"
              min="0"
              name="workingHours"
              placeholder="Enter working hours"
              step="0.1"
              type="number"
              variant="bordered"
            />
          </div>

          {/* Components Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Components Affected</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                classNames={{
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
                label="Component"
                placeholder="Enter component name"
                value={componentInput}
                variant="bordered"
                onChange={(e) => setComponentInput(e.target.value)}
              />

              <Input
                classNames={{
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
                label="Subcomponent"
                placeholder="Enter subcomponent name"
                value={subcomponentInput}
                variant="bordered"
                onChange={(e) => setSubcomponentInput(e.target.value)}
              />
            </div>

            <Button
              color="primary"
              isDisabled={!componentInput || !subcomponentInput}
              size="sm"
              variant="bordered"
              onPress={addComponent}
            >
              Add Component
            </Button>

            <div className="flex flex-wrap gap-2">
              {components.map((comp, index) => (
                <Chip
                  key={index}
                  variant="bordered"
                  onClose={() => removeComponent(index)}
                >
                  {comp.component} - {comp.subcomponent}
                </Chip>
              ))}
            </div>
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
          form="addBreakdownForm"
          isDisabled={
            components.length === 0 || !selectedUnitId || isSubmitting
          }
          isLoading={isSubmitting}
          spinner={
            <svg
              className="animate-spin h-5 w-5 text-current"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
          }
          type="submit"
        >
          {isSubmitting ? "Reporting..." : "Report Breakdown"}
        </Button>
      </ModalFooter>
    </>
  );
}
