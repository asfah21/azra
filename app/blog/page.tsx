import BlogClientPage from "./BlogClientPage";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";

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
