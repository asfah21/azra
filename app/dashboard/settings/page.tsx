// export default function Settings() {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Dashboard Profile</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
//           <h2 className="font-semibold text-lg mb-2">Statistik</h2>
//           <p>Konten statistik atau metrik di sini.</p>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
//           <h2 className="font-semibold text-lg mb-2">Pengguna</h2>
//           <p>Informasi pengguna aktif, baru, dll.</p>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
//           <h2 className="font-semibold text-lg mb-2">Log Aktivitas</h2>
//           <p>Aktivitas terbaru admin atau pengguna.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Switch,
  Button,
  Input,
  Avatar,
  Chip,
  Slider,
} from "@heroui/react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Moon,
  Sun,
  Mail,
  Phone,
  MapPin,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    workOrders: true,
    maintenance: true,
    alerts: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(30);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Settings className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-default-500 mt-1 text-sm sm:text-base">
              Manage your account and system preferences
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            color="default"
            size="sm"
            startContent={<RefreshCw className="w-4 h-4" />}
            variant="flat"
          >
            Reset
          </Button>
          <Button
            color="primary"
            size="sm"
            startContent={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">Profile Settings</p>
              <p className="text-small text-default-600">
                Update your personal information
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {/* Profile Picture & Basic Info */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar
                className="w-16 h-16 sm:w-20 sm:h-20"
                src="https://i.pravatar.cc/150?u=admin"
              />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    defaultValue="Ahmad Facility Manager"
                    label="Full Name"
                    placeholder="Enter your name"
                    size="sm"
                  />
                  <Input
                    defaultValue="Facility Manager"
                    label="Job Title"
                    placeholder="Enter your job title"
                    size="sm"
                  />
                </div>
                <Button color="primary" size="sm" variant="flat">
                  Change Photo
                </Button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-default-700">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  defaultValue="admin@facility.com"
                  label="Email"
                  placeholder="your@email.com"
                  size="sm"
                  startContent={<Mail className="w-4 h-4 text-default-400" />}
                />
                <Input
                  defaultValue="+62 812 3456 7890"
                  label="Phone"
                  placeholder="+62 xxx xxxx xxxx"
                  size="sm"
                  startContent={<Phone className="w-4 h-4 text-default-400" />}
                />
              </div>
              <Input
                defaultValue="Jakarta, Indonesia"
                label="Location"
                placeholder="Your work location"
                size="sm"
                startContent={<MapPin className="w-4 h-4 text-default-400" />}
              />
            </div>

            {/* Password Settings */}
            <div className="space-y-3">
              <h4 className="font-semibold text-default-700">Security</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  endContent={
                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  label="Current Password"
                  placeholder="Enter current password"
                  size="sm"
                  type={showPassword ? "text" : "password"}
                />
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  size="sm"
                  type="password"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Settings */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-success-500 rounded-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">Quick Settings</p>
              <p className="text-small text-default-600">System preferences</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-small text-default-600">
                    Toggle dark theme
                  </p>
                </div>
              </div>
              <Switch
                color="primary"
                isSelected={darkMode}
                onValueChange={setDarkMode}
              />
            </div>

            {/* Auto Refresh */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5" />
                <p className="font-medium">Auto Refresh</p>
              </div>
              <div className="space-y-2">
                <Slider
                  className="max-w-full"
                  color="primary"
                  label="Refresh interval (seconds)"
                  maxValue={300}
                  minValue={10}
                  step={5}
                  value={autoRefresh}
                  onChange={(value) =>
                    setAutoRefresh(Array.isArray(value) ? value[0] : value)
                  }
                />
                <p className="text-small text-default-600">
                  Dashboard will refresh every {autoRefresh} seconds
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-warning-500 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">Notifications</p>
              <p className="text-small text-default-600">
                Manage alerts and notifications
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            {/* Notification Types */}
            <div className="space-y-3">
              <p className="font-medium text-small">Notification Methods</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-small font-medium">
                      Email Notifications
                    </p>
                    <p className="text-tiny text-default-600">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    color="primary"
                    isSelected={notifications.email}
                    size="sm"
                    onValueChange={(value) =>
                      handleNotificationChange("email", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-small font-medium">Push Notifications</p>
                    <p className="text-tiny text-default-600">
                      Browser notifications
                    </p>
                  </div>
                  <Switch
                    color="primary"
                    isSelected={notifications.push}
                    size="sm"
                    onValueChange={(value) =>
                      handleNotificationChange("push", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-small font-medium">SMS Alerts</p>
                    <p className="text-tiny text-default-600">
                      Text message alerts
                    </p>
                  </div>
                  <Switch
                    color="primary"
                    isSelected={notifications.sms}
                    size="sm"
                    onValueChange={(value) =>
                      handleNotificationChange("sms", value)
                    }
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* Alert Categories */}
            <div className="space-y-3">
              <p className="font-medium text-small">Alert Categories</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Chip color="primary" size="sm" variant="dot">
                      Work Orders
                    </Chip>
                  </div>
                  <Switch
                    color="primary"
                    isSelected={notifications.workOrders}
                    size="sm"
                    onValueChange={(value) =>
                      handleNotificationChange("workOrders", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Chip color="success" size="sm" variant="dot">
                      Maintenance
                    </Chip>
                  </div>
                  <Switch
                    color="success"
                    isSelected={notifications.maintenance}
                    size="sm"
                    onValueChange={(value) =>
                      handleNotificationChange("maintenance", value)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Chip color="danger" size="sm" variant="dot">
                      Critical Alerts
                    </Chip>
                  </div>
                  <Switch
                    color="danger"
                    isSelected={notifications.alerts}
                    size="sm"
                    onValueChange={(value) =>
                      handleNotificationChange("alerts", value)
                    }
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-secondary-500 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">System</p>
              <p className="text-small text-default-600">
                System configuration
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            {/* Data Management */}
            <div className="space-y-3">
              <p className="font-medium text-small">Data Management</p>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  color="default"
                  size="sm"
                  variant="flat"
                >
                  Export Data
                </Button>
                <Button
                  className="w-full justify-start"
                  color="default"
                  size="sm"
                  variant="flat"
                >
                  Import Data
                </Button>
                <Button
                  className="w-full justify-start"
                  color="warning"
                  size="sm"
                  variant="flat"
                >
                  Clear Cache
                </Button>
              </div>
            </div>

            <Divider />

            {/* Security */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <p className="font-medium text-small">Security</p>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  color="primary"
                  size="sm"
                  variant="flat"
                >
                  Two-Factor Auth
                </Button>
                <Button
                  className="w-full justify-start"
                  color="default"
                  size="sm"
                  variant="flat"
                >
                  Session Management
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
