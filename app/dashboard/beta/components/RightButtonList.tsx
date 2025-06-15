import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Textarea,
  DatePicker,
} from "@heroui/react";
import { Button } from "@heroui/react";
import { Wrench, Filter, Search } from "lucide-react";

export default function AssetRightButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Data dummy untuk select options
  const categories = [
    { key: "1", value: 1, label: "Electronics" },
    { key: "2", value: 2, label: "Furniture" },
    { key: "3", value: 3, label: "Vehicles" },
    { key: "4", value: 4, label: "Machinery" },
  ];

  const statusOptions = [
    { key: "operational", value: "operational", label: "Operational" },
    { key: "out_of_service", value: "out_of_service", label: "Out of Service" },
    { key: "maintenance", value: "maintenance", label: "Under Maintenance" },
    { key: "retired", value: "retired", label: "Retired" },
  ];

  const conditionOptions = [
    { key: "excellent", value: "excellent", label: "Excellent" },
    { key: "good", value: "good", label: "Good" },
    { key: "fair", value: "fair", label: "Fair" },
    { key: "poor", value: "poor", label: "Poor" },
  ];

  return (
    <>
      <Button
        className="flex-1 sm:flex-none min-w-0"
        color="default"
        size="sm"
        startContent={<Filter className="w-4 h-4" />}
        variant="flat"
      >
        <span className="hidden xs:inline">Filter</span>
      </Button>
      <Button
        className="flex-1 sm:flex-none min-w-0"
        color="default"
        size="sm"
        startContent={<Search className="w-4 h-4" />}
        variant="flat"
      >
        <span className="hidden xs:inline">Search</span>
      </Button>
      {/* <Button
            className="flex-1 sm:flex-none min-w-0"
            color="primary"
            size="sm"
            startContent={<Plus className="w-4 h-4" />}
          >
            <span className="hidden xs:inline">Add Asset</span>
            <span className="xs:hidden">Add</span>
          </Button> */}

      <Button color="primary" startContent={<Wrench />} onPress={onOpen}>
        Add Asset
      </Button>
      <Modal isOpen={isOpen} size="xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add New Asset
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kolom 1 */}
                  <div className="space-y-4">
                    <Input
                      isRequired
                      label="Asset Tag"
                      placeholder="Enter unique asset tag"
                      variant="bordered"
                    />

                    <Input
                      isRequired
                      label="Name"
                      placeholder="Enter asset name"
                      variant="bordered"
                    />

                    <Textarea
                      label="Description"
                      placeholder="Enter asset description"
                      variant="bordered"
                    />

                    <Select
                      isRequired
                      label="Category"
                      placeholder="Select category"
                      variant="bordered"
                    >
                      {categories.map((category) => (
                        <SelectItem key={category.key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      defaultSelectedKeys={["operational"]}
                      label="Status"
                      variant="bordered"
                    >
                      {statusOptions.map((status) => (
                        <SelectItem key={status.key}>{status.label}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Kolom 2 */}
                  <div className="space-y-4">
                    <Select
                      label="Condition"
                      placeholder="Select condition"
                      variant="bordered"
                    >
                      {conditionOptions.map((condition) => (
                        <SelectItem key={condition.key}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      label="Serial Number"
                      placeholder="Enter serial number"
                      variant="bordered"
                    />

                    <Input
                      isRequired
                      label="Location"
                      placeholder="Enter location"
                      variant="bordered"
                    />

                    <Input
                      label="Department"
                      placeholder="Enter department"
                      variant="bordered"
                    />

                    <Input
                      label="Manufacturer"
                      placeholder="Enter manufacturer"
                      variant="bordered"
                    />
                  </div>
                </div>

                {/* Baris bawah */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <DatePicker label="Install Date" variant="bordered" />

                  <DatePicker label="Warranty Expiry" variant="bordered" />

                  <DatePicker label="Last Maintenance" variant="bordered" />

                  <DatePicker label="Next Maintenance" variant="bordered" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Asset Value"
                    placeholder="Enter value"
                    startContent={<span className="text-default-400">$</span>}
                    type="number"
                    variant="bordered"
                  />

                  <Input
                    endContent={<span className="text-default-400">%</span>}
                    label="Utilization Rate (%)"
                    placeholder="Enter utilization rate"
                    type="number"
                    variant="bordered"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Add Asset
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
