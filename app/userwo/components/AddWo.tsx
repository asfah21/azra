"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

import { createBreakdown, getUsers } from "@/app/userwo/action";

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

interface User {
  id: string;
  name: string;
  email: string;
}

export function AddWoForm({ onClose, onBreakdownAdded }: AddWoFormProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [subcomponentInput, setSubcomponentInput] = useState("");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState("low");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [state, formAction, isPending] = useActionState(createBreakdown, null);

  const [breakdownNumber, setBreakdownNumber] = useState("");
  const queryClient = useQueryClient();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus the first input when modal opens
  useEffect(() => {
    if (firstInputRef.current) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  // Load units and users data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch units
        const unitsRes = await axios.get(
          "/api/dashboard/workorders?units=true",
        );

        setUnits(unitsRes.data);
        setLoadingUnits(false);

        // Fetch users
        const usersRes = await getUsers();

        setUsers(usersRes);
        setLoadingUsers(false);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoadingUnits(false);
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, []);

  // Auto close modal if successfully added breakdown
  useEffect(() => {
    if (state?.success && state?.message) {
      queryClient.invalidateQueries({ queryKey: ["breakdowns"] });

      const timer = setTimeout(() => {
        onClose();
        if (onBreakdownAdded) {
          onBreakdownAdded();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state?.success, state?.message, onClose, onBreakdownAdded, queryClient]);

  const addComponent = () => {
    if (subcomponentInput.trim()) {
      setComponents([
        ...components,
        {
          component: `${components.length + 1}.`,
          subcomponent: subcomponentInput,
        },
      ]);
      setSubcomponentInput("");
    }
  };

  const removeComponent = (index: number) => {
    const newComponents = [...components];

    newComponents.splice(index, 1);
    const reIndexed = newComponents.map((comp, idx) => ({
      ...comp,
      component: `${idx + 1}.`,
    }));

    setComponents(reIndexed);
  };

  const handleSubmit = async (formData: FormData) => {
    // Debug: Log form data
    console.log("Form Data being submitted:");
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(key, value);
    });
    const formDataObj: Record<string, any> = {};

    Array.from(formData.entries()).forEach(([key, value]) => {
      formDataObj[key] = value;
    });
    console.log(formDataObj);
    await formAction(formData);
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">New Work Order</h2>
      </ModalHeader>

      <ModalBody className="max-h-[60vh] overflow-y-auto">
        <form action={handleSubmit} className="space-y-4" id="addBreakdownForm">
          {/* Hidden fields */}
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
            className="hidden"
            label="Breakdown Number"
            name="breakdownNumber"
            type="text"
            value={breakdownNumber}
            variant="bordered"
          />

          {/* User Selection */}
          <div className="flex flex-col gap-2">
            <Autocomplete
              isRequired
              classNames={{
                base: "min-h-unit-16 py-2",
              }}
              defaultItems={users}
              isLoading={loadingUsers}
              label="Reported By"
              placeholder={loadingUsers ? "Loading users..." : "Select user"}
              selectedKey={selectedUserId}
              variant="bordered"
              onSelectionChange={(key) =>
                setSelectedUserId(key?.toString() || "")
              }
            >
              {(item) => (
                <AutocompleteItem
                  key={item.id}
                  textValue={`${item.name} (${item.email})`}
                >
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500">{item.email}</span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
            <input name="reportedById" type="hidden" value={selectedUserId} />
          </div>

          {/* Unit Selection */}
          <Autocomplete
            isRequired
            defaultItems={units}
            isLoading={loadingUnits}
            label="Unit"
            placeholder={loadingUnits ? "Loading units..." : "Select unit"}
            selectedKey={selectedUnitId}
            variant="bordered"
            onSelectionChange={(key) =>
              setSelectedUnitId(key?.toString() || "")
            }
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
          <input name="unitId" type="hidden" value={selectedUnitId} />
          {/* Debug: Display selected values */}
          {/* <div className="text-xs text-gray-500">
            Selected Unit ID: {selectedUnitId || "None"}
            Selected User ID: {selectedUserId || "None"}
          </div> */}

          <Input
            ref={firstInputRef}
            isRequired
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">hours</span>
              </div>
            }
            label="Hours Meter"
            min="0"
            name="workingHours"
            placeholder="Enter unit HM"
            step="0.1"
            type="number"
            variant="bordered"
          />

          <Textarea
            isRequired
            label="Position"
            name="description"
            placeholder="Describe your current position in detail"
            variant="bordered"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              isRequired
              defaultValue={new Date(Date.now() + 8 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 16)}
              label="Breakdown Time"
              name="breakdownTime"
              type="datetime-local"
              variant="bordered"
            />

            <Select
              isRequired
              label="Shift"
              name="shift"
              placeholder="Select shift"
              selectedKeys={selectedShift ? [selectedShift] : []}
              variant="bordered"
              onSelectionChange={(keys) => {
                const keyArray = Array.from(keys);

                setSelectedShift(keyArray[0]?.toString() || "");
              }}
            >
              <SelectItem key="siang">Siang</SelectItem>
              <SelectItem key="malam">Malam</SelectItem>
            </Select>

            <div className="space-y-4 hidden">
              <Select
                isRequired
                label="Priority"
                name="priority"
                placeholder="Select priority"
                selectedKeys={selectedPriority ? [selectedPriority] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const keyArray = Array.from(keys);

                  setSelectedPriority(keyArray[0]?.toString() || "");
                }}
              >
                <SelectItem key="low">Low</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="high">High</SelectItem>
              </Select>
            </div>
          </div>

          {/* Components Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Report</h3>
            <Input
              label="Report Description"
              placeholder="Tyre no 10 bocor"
              value={subcomponentInput}
              variant="bordered"
              onChange={(e) => setSubcomponentInput(e.target.value)}
            />
            <Button
              color="primary"
              isDisabled={!subcomponentInput}
              size="sm"
              variant="bordered"
              onPress={addComponent}
            >
              Add Report
            </Button>
            <div className="flex flex-wrap gap-2">
              {components.map((comp, index) => (
                <Chip
                  key={index}
                  variant="bordered"
                  onClose={() => removeComponent(index)}
                >
                  {`${index + 1}. ${comp.subcomponent}`}
                </Chip>
              ))}
            </div>
          </div>

          {/* Status Messages */}
          {state?.message && (
            <Card
              className={
                state.success
                  ? "border-success-200 bg-success-50"
                  : "border-danger-200 bg-danger-50"
              }
            >
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${state.success ? "bg-success-500" : "bg-danger-500"}`}
                  />
                  <p
                    className={`text-sm font-medium ${state.success ? "text-success-700" : "text-danger-700"}`}
                  >
                    {state.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </form>
      </ModalBody>

      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          form="addBreakdownForm"
          isDisabled={
            components.length === 0 ||
            !selectedUnitId ||
            !selectedShift ||
            !selectedPriority ||
            !selectedUserId ||
            isPending
          }
          isLoading={isPending}
          type="submit"
        >
          {isPending ? "Creating..." : "Create WO"}
        </Button>
      </ModalFooter>
    </>
  );
}
