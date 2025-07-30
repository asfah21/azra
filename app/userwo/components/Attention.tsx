import { Card } from "@heroui/react";

import { VersiApp } from "@/components/ui/ChipVersion";

export default function Attention() {
  return (
    <div>
      <Card className="bg-white dark:bg-neutral-900 p-1 my-6 mt-8">
        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-gray-700 dark:text-gray-300 text-center text-base">
            You're using{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300">
              AZRA
            </span>{" "}
            <VersiApp />, our MVP release. This is an early version, and some features are still being built. Stay tuned for updates!
          </p>
        </div>
      </Card>
    </div>
  );
}
