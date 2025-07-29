import { Metadata } from "next";

import AssetsClientPage from "./AssetsClientPage";

export const metadata: Metadata = {
  title: "Asset Management",
  description: "Manage assets and view statistics",
};

export default function AssetsPage() {
  return <AssetsClientPage />;
}
