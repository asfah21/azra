
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import BlogsClientPage from "./BlogsClientPage";

export const metadata = {
  title: "About PT GSI",
};

export default function BlogsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <BlogsClientPage />
      </main>
      <Footer />
    </div>
  );
}
