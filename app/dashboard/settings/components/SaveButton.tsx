"use client";
import { Button } from "@heroui/button";
import { Save } from "lucide-react";

export default function SaveButton() {
  return (
    <div className="flex gap-2">          
      <Button
        color="primary"
        size="sm"
        startContent={<Save className="w-4 h-4" />}
      >
        Save Changes
      </Button>
    </div>
  );
}