"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Switch,
  Slider,
} from "@heroui/react";
import { Palette, Moon, Sun, RefreshCw } from "lucide-react";
import { useState } from "react";
export default function QuickSettingCard() {
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(30);

  return (
    <>
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
                <p className="text-small text-default-600">Toggle dark theme</p>
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
    </>
  );
}
