import WheelClientPage from "./WheelClientPage";

export const metadata = {
  title: "Wheel 8th Anniversary",
};

export default function WheelPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col">
        <WheelClientPage />
      </main>
    </div>
  );
}
