"use client";
import { Tooltip, Button } from "@heroui/react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Database, Shield } from "lucide-react";

export default function SystemSetting() {
  return (
    <>
      <Card>
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-secondary-500 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold">System</p>
            <p className="text-small text-default-600">System configuration</p>
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
          <p className="text-xs text-warning">Fitur belum tersedia untuk versi ini</p>
        </CardBody>
        
      </Card>
    </>
  );
}
