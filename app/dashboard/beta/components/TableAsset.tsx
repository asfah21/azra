import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Button,
  Progress,
  User,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Package,
  Wrench,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Filter,
  Plus,
  Activity,
} from "lucide-react";
export default function TableAssets() {
  const assetInventory = [
    {
      id: "AST-2024-001",
      name: "HVAC System Building A",
      description:
        "Central air conditioning and ventilation system for main building",
      category: "HVAC",
      status: "operational",
      assignedTo: "Ahmad Ridwan",
      assignedAvatar: "https://i.pravatar.cc/150?u=1",
      location: "Building A - Rooftop",
      department: "Facilities",
      manufacturer: "Daikin Industries",
      installDate: "Jan 15, 2022",
      warrantyExpiry: "Jan 15, 2027",
      lastMaintenance: "Dec 10, 2024",
      nextMaintenance: "Jan 10, 2025",
      assetValue: "$45,000",
      serialNumber: "HVAC-001-2022",
      condition: "excellent",
      utilizationRate: 85,
    },
    {
      id: "AST-2024-002",
      name: "Main Electrical Panel",
      description:
        "Primary electrical distribution panel for facility power management",
      category: "electrical",
      status: "operational",
      assignedTo: "Siti Nurhaliza",
      assignedAvatar: "https://i.pravatar.cc/150?u=2",
      location: "Main Building - Electrical Room",
      department: "Electrical",
      manufacturer: "Schneider Electric",
      installDate: "Mar 20, 2021",
      warrantyExpiry: "Mar 20, 2026",
      lastMaintenance: "Dec 05, 2024",
      nextMaintenance: "Dec 20, 2024",
      assetValue: "$25,000",
      serialNumber: "EL-PANEL-01-2021",
      condition: "good",
      utilizationRate: 92,
    },
    {
      id: "AST-2024-003",
      name: "Water Circulation Pump",
      description:
        "High-capacity centrifugal pump for building water circulation system",
      category: "mechanical",
      status: "maintenance",
      assignedTo: "Budi Santoso",
      assignedAvatar: "https://i.pravatar.cc/150?u=3",
      location: "Utility Room - Block C",
      department: "Mechanical",
      manufacturer: "Grundfos",
      installDate: "Jul 10, 2020",
      warrantyExpiry: "Jul 10, 2025",
      lastMaintenance: "Dec 12, 2024",
      nextMaintenance: "Mar 12, 2025",
      assetValue: "$15,000",
      serialNumber: "PUMP-WS-03-2020",
      condition: "fair",
      utilizationRate: 78,
    },
    {
      id: "AST-2024-004",
      name: "Fire Safety System",
      description:
        "Integrated fire detection, suppression and alarm system for all buildings",
      category: "safety",
      status: "operational",
      assignedTo: "Maya Sari",
      assignedAvatar: "https://i.pravatar.cc/150?u=4",
      location: "All Buildings",
      department: "Safety",
      manufacturer: "Johnson Controls",
      installDate: "Sep 05, 2019",
      warrantyExpiry: "Sep 05, 2024",
      lastMaintenance: "Dec 12, 2024",
      nextMaintenance: "Jan 12, 2025",
      assetValue: "$85,000",
      serialNumber: "FIRE-SYS-ALL-2019",
      condition: "excellent",
      utilizationRate: 95,
    },
    {
      id: "AST-2024-005",
      name: "Backup Power Generator",
      description:
        "Emergency diesel generator for critical power backup operations",
      category: "power",
      status: "standby",
      assignedTo: "Indra Kusuma",
      assignedAvatar: "https://i.pravatar.cc/150?u=5",
      location: "Generator Room - Basement",
      department: "Electrical",
      manufacturer: "Caterpillar",
      installDate: "Nov 15, 2021",
      warrantyExpiry: "Nov 15, 2026",
      lastMaintenance: "Nov 30, 2024",
      nextMaintenance: "Feb 28, 2025",
      assetValue: "$120,000",
      serialNumber: "GEN-001-2021",
      condition: "excellent",
      utilizationRate: 5,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "danger";
      case "Warning":
        return "warning";
      case "Maintenance":
        return "primary";
      case "Operational":
        return "success";
      case "operational":
        return "success";
      case "maintenance":
        return "warning";
      case "standby":
        return "secondary";
      case "critical":
        return "danger";
      default:
        return "default";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "HVAC":
        return "❄️";
      case "electrical":
        return "⚡";
      case "mechanical":
        return "⚙️";
      case "safety":
        return "🛡️";
      case "power":
        return "🔋";
      default:
        return "📦";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "success";
      case "good":
        return "primary";
      case "fair":
        return "warning";
      case "poor":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader className="flex gap-3">
        <div className="p-2 bg-default-500 rounded-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-lg sm:text-xl font-semibold text-default-800">
            Asset Inventory
          </p>
          <p className="text-xs sm:text-small text-default-600">
            Complete asset registry and management overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="hidden sm:flex"
            color="default"
            size="sm"
            startContent={<Filter className="w-4 h-4" />}
            variant="flat"
          >
            Filter
          </Button>
          <Button
            color="primary"
            size="sm"
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Asset
          </Button>
        </div>
      </CardHeader>
      <Divider />

      <CardBody className="px-0">
        <div className="overflow-x-auto">
          <Table aria-label="Asset inventory table">
            <TableHeader>
              <TableColumn>ASSET</TableColumn>
              <TableColumn>OWNER</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>LOCATION</TableColumn>
              <TableColumn>CONDITION</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {assetInventory.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{asset.id}</span>
                        <span className="text-xs">
                          {getCategoryIcon(asset.category)}
                        </span>
                      </div>
                      <p className="text-xs text-default-600 line-clamp-1">
                        {asset.name}
                      </p>
                      <p className="text-xs text-default-500">
                        S/N: {asset.serialNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <User
                      avatarProps={{
                        radius: "lg",
                        src: asset.assignedAvatar,
                        size: "sm",
                      }}
                      classNames={{
                        name: "text-sm font-medium",
                        description: "text-xs text-default-500",
                      }}
                      description={asset.department}
                      name={asset.assignedTo}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      className="capitalize"
                      color="default"
                      size="sm"
                      variant="flat"
                    >
                      {asset.category}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(asset.status) as any}
                      size="sm"
                      variant="dot"
                    >
                      {asset.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-default-500" />
                      <span className="text-sm">{asset.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Chip
                        color={getConditionColor(asset.condition) as any}
                        size="sm"
                        variant="flat"
                      >
                        {asset.condition}
                      </Chip>
                      <Progress
                        aria-label="Utilization rate"
                        className="max-w-16"
                        color={
                          asset.utilizationRate > 90
                            ? "danger"
                            : asset.utilizationRate > 70
                              ? "warning"
                              : "success"
                        }
                        size="sm"
                        value={asset.utilizationRate}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Asset actions">
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                          >
                            Edit Asset
                          </DropdownItem>
                          <DropdownItem
                            key="maintenance"
                            startContent={<Wrench className="w-4 h-4" />}
                          >
                            Log Maintenance
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                          >
                            Delete Asset
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <Button isIconOnly size="sm" variant="flat">
                        <Activity className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
}
