import { Metadata } from "next";

import PostClientPage from "./PostClientPage";

export const metadata: Metadata = {
  title: "Post Management",
  description: "Manage posts and view statistics",
};

export default function PostPage() {
  return <PostClientPage />;
}
