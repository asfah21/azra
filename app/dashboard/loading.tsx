export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        {/* Dot Wave Animation */}
        <div className="flex items-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '0.6s',
                transformOrigin: 'center bottom',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
