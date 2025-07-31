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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createBreakdown, null);

  const [breakdownNumber, setBreakdownNumber] = useState("");
  const queryClient = useQueryClient();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Reset errors
    setPhotoError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file (JPEG, PNG, etc.)");

      return;
    }

    // Validate file size (3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError("File size exceeds 3MB limit");

      return;
    }

    setPhoto(file);

    // Create preview
    const reader = new FileReader();

    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected photo
  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
  };

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
    try {
      // Create a new FormData object to ensure we're working with the latest data
      const newFormData = new FormData();

      // Copy all existing form data
      formData.forEach((value, key) => {
        newFormData.append(key, value);
      });

      // Append photo to formData if available
      if (photo && photo instanceof File) {
        newFormData.append("photo", photo);
      }

      // Debug: Log form data
      console.log("Form Data being submitted:");
      Array.from(newFormData.entries()).forEach(([key, value]) => {
        console.log(key, value);
      });

      await formAction(newFormData);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Set error state to display to user
      // You might want to add an error state to display this to the user
    }
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

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Photo Upload</h3>
            <div className="flex flex-col gap-2">
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer bg-default-100 hover:bg-default-200 transition-colors p-4">
                {photoPreview ? (
                  <div className="relative w-full h-32">
                    <img
                      alt="Preview"
                      className="w-full h-full object-contain rounded-md"
                      src={photoPreview}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <p className="text-xs text-gray-500">Upload Photo</p>
                  </div>
                )}
                <input
                  accept="image/*"
                  className="hidden"
                  type="file"
                  onChange={handlePhotoChange}
                />
              </label>
              {photo && (
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{photo.name}</p>
                  <p className="text-xs text-gray-500">
                    {(photo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    className="mt-2 w-fit"
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={removePhoto}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
            {photoError && (
              <p className="text-sm text-danger-500">{photoError}</p>
            )}
            <p className="text-xs text-gray-500">
              Max file size: 3MB. Formats: JPEG, PNG, GIF.
            </p>
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
