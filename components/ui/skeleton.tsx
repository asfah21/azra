import { Spinner } from "@heroui/react";

export function SpinnerHero() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-small text-default-500">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-small text-default-500">Loading...</p>
      </div>
    </div>
  );
}
