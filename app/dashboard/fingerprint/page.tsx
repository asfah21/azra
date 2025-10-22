import { Metadata } from "next";
import ClientPage from "./ClientPage";

// import UsersClientPage from "./UsersClientPage";

export const metadata: Metadata = {
  title: "Fingerprint",
  description: "Manage fingerprints GSI",
};

export default function FingerprintPage() {
  return <ClientPage />;
}
