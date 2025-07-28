import { Navbar } from "@/components/navbar";
import ClientPage from "./ClientPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "User Work Order",
};

export default function UserwoPage() {
  return (
    <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <ClientPage />
          </main>
          <Footer />
        </div>
    
  );
}
