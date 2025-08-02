import UnitClientPage from "./UnitClientPage";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "User Work Order",
};

export default function UnitPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <UnitClientPage />
      </main>
      <Footer />
    </div>
  );
}
