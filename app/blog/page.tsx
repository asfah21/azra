
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import BlogClientPage from "./BlogClientPage";

export const metadata = {
  title: "About PT GSI",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <BlogClientPage />
      </main>
      <Footer />
    </div>
  );
}
