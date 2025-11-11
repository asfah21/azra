"use client";

import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import DashboardFooter from "../components/DashboardFooter";

import PostCardGrids from "./components/CardGrid";
import PostsTable from "./components/PostsTable";

import { AssetSkeleton } from "@/components/ui/skeleton";

export default function PostClientPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axios.get("/api/dashboard/posts");

      return res.data as { postStats: any; posts: any[] };
    },
    refetchInterval: 10000,
  });

  const postStats = data?.postStats || {
    total: 0,
    published: 0,
    drafts: 0,
    withCover: 0,
    withMeta: 0,
  };
  const posts = data?.posts || [];

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Post Management
            </h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <AssetSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data post.
        </div>
      ) : (
        <>
          <PostCardGrids stats={postStats} />
          <PostsTable posts={posts} />
        </>
      )}
      <DashboardFooter className="mt-10 mb-[-10px] md:mb-[-30px]" />
    </div>
  );
}
