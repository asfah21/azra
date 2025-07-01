"use client";

import { Card, CardHeader, CardBody, Divider, Switch, Chip } from "@heroui/react";
import { Bell } from "lucide-react";
import { useState } from "react";

export default function NotificationSetting() {
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
        <>
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
                                    <p className="text-small font-medium">Email Notifications</p>
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
                                    onValueChange={(value) => handleNotificationChange("alerts", value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    );
}
