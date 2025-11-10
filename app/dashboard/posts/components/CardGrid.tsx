"use client";

import { Card, CardHeader, CardBody, Chip, Divider, Progress } from "@heroui/react";
import { FileText, Eye, Pencil, Image as ImageIcon } from "lucide-react";

interface PostStats {
  total: number;
  published: number;
  drafts: number;
  withCover: number;
  // withMeta omitted
}

export default function PostCardGrids({ stats }: { stats: PostStats }) {
  const publishedPct = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;
  const draftsPct = stats.total > 0 ? Math.round((stats.drafts / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {/* Total Posts */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-primary-500 rounded-lg">
            <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-primary-800 truncate">Total Posts</p>
            <p className="text-xs sm:text-small text-primary-600">All Articles</p>
          </div>
        </CardHeader>
        <Divider className="bg-primary-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-primary-700">{stats.total}</span>
              <Chip color="primary" size="sm" variant="flat">Posts</Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">Content inventory</p>
          </div>
        </CardBody>
      </Card>

      {/* Published Posts */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-success-500 rounded-lg">
            <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-success-800 truncate">Published</p>
            <p className="text-xs sm:text-small text-success-600">Live Posts</p>
          </div>
        </CardHeader>
        <Divider className="bg-success-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-success-700">{stats.published}</span>
              <Chip color="success" size="sm" variant="flat">{publishedPct}%</Chip>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-small text-default-600">Publish Ratio</span>
                <span className="text-xs sm:text-small font-medium">{publishedPct}%</span>
              </div>
              <Progress aria-label="Published ratio" className="max-w-full" color="success" size="sm" value={publishedPct} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Draft Posts */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-warning-500 rounded-lg">
            <Pencil className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-warning-800 truncate">Drafts</p>
            <p className="text-xs sm:text-small text-warning-600">Unpublished</p>
          </div>
        </CardHeader>
        <Divider className="bg-warning-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-warning-700">{stats.drafts}</span>
              <Chip color="warning" size="sm" variant="flat">{draftsPct}%</Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">Need review / finishing</p>
          </div>
        </CardBody>
      </Card>

      {/* Posts With Cover */}
      <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-danger-500 rounded-lg">
            {/* <Image as={undefined} /> */}
            <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-danger-800 truncate">With Cover</p>
            <p className="text-xs sm:text-small text-danger-600">Featured media</p>
          </div>
        </CardHeader>
        <Divider className="bg-danger-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-danger-700">{stats.withCover}</span>
              <Chip color="danger" size="sm" variant="flat">Media</Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">Posts with cover image</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
