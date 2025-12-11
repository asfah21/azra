import { Link } from "@heroui/react";

import { VersiAppSm } from "@/components/ui/ChipVersion";

// components/site-footer.tsx
export default function DashboardFooter({
  className = "",
}: {
  className?: string;
}) {
  return (
    <footer
      className={`w-full rounded-lg bg-gray-100/50 backdrop-blur dark:bg-gray-900/40 dark:border-gray-700 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-col gap-1 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span className="text-xs">
            <Link
              className="text-default-600 gap-1 text-xs"
              color="foreground"
              href="/"
              underline="none"
            >
              {/* <span>&copy; {new Date().getFullYear()}</span> */}
              {/* <p>Created by</p> */}
              <p className="bg-gradient-to-r text-sm font-extrabold from-blue-600 to-green-600 bg-clip-text text-transparent font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300">
                AZRA
              </p>
              <VersiAppSm /> (beta)
            </Link>
          </span>
          {/* <span className="text-xs text-gray-600 dark:text-gray-300">
              Created by Azvan IT
            </span> */}
          <span className="text-xs text-gray-600 dark:text-gray-300">
            © 2025 - Azra
          </span>
        </div>
      </div>
    </footer>
  );
}
