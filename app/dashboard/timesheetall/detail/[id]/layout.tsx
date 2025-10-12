export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-background -mt-6 p-0" style={{ padding: 0 }}>
      {children}
    </main>
  );
}
