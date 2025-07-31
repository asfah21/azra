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
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

import { createBreakdown } from "../action";

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
  const [subcomponentInput, setSubcomponentInput] = useState("");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("low");

  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [loadingUnits, setLoadingUnits] = useState(true);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createBreakdown, null);

  const [breakdownNumber, setBreakdownNumber] = useState("");
  const queryClient = useQueryClient();

  // Load units data on component mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get("/api/dashboard/workorders?units=true");

        setUnits(res.data);
        setLoadingUnits(false);
      } catch (error) {
        console.error("Failed to load units:", error);
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, []);

  // Tambahkan useEffect untuk fetch breakdownNumber setiap kali AddForm dibuka
  useEffect(() => {
    async function fetchBreakdownNumber() {
      try {
        const res = await axios.get(
          `/api/dashboard/workorders?nextNumber=true&role=${userRole}`,
        );

        setBreakdownNumber(res.data.nextBreakdownNumber || "");
      } catch (error) {
        setBreakdownNumber("");
      }
    }
    if (userRole) {
      fetchBreakdownNumber();
    }
  }, [userRole]);

  // Auto close modal jika berhasil add breakdown
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
    // Re-index nomor komponen setelah penghapusan
    const reIndexed = newComponents.map((comp, idx) => ({
      ...comp,
      component: `${idx + 1}.`,
    }));

    setComponents(reIndexed);
  };

  // Handle form submission dengan loading state
  const handleSubmit = async (formData: FormData) => {
    // Append photo to formData if available
    if (photo) {
      formData.append("photo", photo);
    }

    await formAction(formData);
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
        <h2 className="text-xl font-semibold">New Work Order</h2>
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
            className="hidden"
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

          {/* Unit Selection */}
          <Autocomplete
            isRequired
            classNames={{
              base: [
                "text-black/50 dark:text-white/90",
                "bg-default-200/50",
                "dark:bg-default/60 rounded-xl",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
              ],
              // trigger: [
              //   "bg-default-200/50",
              //   "dark:bg-default/60",
              //   "backdrop-blur-xl",
              //   "backdrop-saturate-200",
              //   "hover:bg-default-200/70",
              //   "dark:hover:bg-default/70",
              //   "group-data-[focused=true]:bg-default-200/50",
              //   "dark:group-data-[focused=true]:bg-default/60",
              // ],
              // value: "text-black/90 dark:text-white/90",
            }}
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

          {/* Select Unit Fields */}
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
          </Select> */}

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
            label="Position"
            name="description"
            placeholder="Describe your current position in detail"
            variant="bordered"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
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
                defaultValue={new Date(Date.now() + 8 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16)}
                label="Breakdown Time"
                name="breakdownTime"
                type="datetime-local"
                variant="bordered"
              />
            </div>

            <div className="space-y-4">
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
            </div>

            <div className="space-y-4 hidden">
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
            <h3 className="text-sm font-medium">Photo</h3>
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
                      className="w-8 h-8 mb-4 text-gray-500"
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
              Max file size: 3MB. Supported formats: JPEG, PNG, GIF.
            </p>
          </div>

          {/* Components Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Report</h3>
            <div className="grid grid-cols-1 gap-4">
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
                label="Report Description"
                placeholder="Tyre no 10 bocor"
                value={subcomponentInput}
                variant="bordered"
                onChange={(e) => setSubcomponentInput(e.target.value)}
              />
            </div>
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
            components.length === 0 ||
            !selectedUnitId ||
            !selectedShift ||
            !selectedPriority ||
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
