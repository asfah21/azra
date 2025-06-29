// Komponen loading spinner yang seragam untuk seluruh aplikasi
function UnifiedSpinner({
  size = "lg",
  showText = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-8 h-8 border-3",
    md: "w-10 h-10 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
      />
      {showText && <p className="text-small text-default-500">Loading...</p>}
    </div>
  );
}

// Loading spinner utama yang konsisten untuk seluruh aplikasi
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <UnifiedSpinner showText={true} size="lg" />
    </div>
  );
}

// Loading spinner untuk halaman login (konsisten dengan yang lain)
export function LoginSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black">
      <UnifiedSpinner showText={true} size="lg" />
    </div>
  );
}

// Loading spinner untuk overlay navigasi (konsisten dengan yang lain)
export function OverlaySpinner() {
  return (
    <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
      <UnifiedSpinner showText={true} size="lg" />
    </div>
  );
}

// Loading spinner yang lebih ringan untuk navigasi
export function NavigationSpinner() {
  return (
    <div className="flex items-center justify-center">
      <UnifiedSpinner showText={false} size="sm" />
    </div>
  );
}

// Legacy spinner untuk backward compatibility
export function SpinnerHero() {
  return <LoadingSpinner />;
}
