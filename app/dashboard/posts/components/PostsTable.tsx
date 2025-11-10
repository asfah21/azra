"use client";
import React, { useMemo, useState, useDeferredValue, useCallback, startTransition } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  User,
  Modal,
  ModalContent,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { FileText, Search, Upload, Download, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import ImportPostsModal from "./ImportPostsModal";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string | null;
  author?: { id: string; name: string | null; avatar?: string | null; photo?: string | null } | null;
}

const ROWS_PER_PAGE = 10;

export default function PostsTable({ posts }: { posts: PostRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { isOpen: isImportOpen, onOpen: onImportOpen, onOpenChange: onImportOpenChange } = useDisclosure();
  const router = useRouter();

  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchQuery(value);
      setPage(1);
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!deferredSearchQuery.trim()) return posts ?? [];
    const q = deferredSearchQuery.toLowerCase();
    return (posts ?? []).filter(p => {
      const inTitle = p.title?.toLowerCase().includes(q);
      const inSlug = p.slug?.toLowerCase().includes(q);
      const inCategory = p.category?.toLowerCase().includes(q);
      const inTags = (p.tags ?? []).join(" ").toLowerCase().includes(q);
      const inAuthor = (p.author?.name || "").toLowerCase().includes(q);
      return inTitle || inSlug || inCategory || inTags || inAuthor;
    });
  }, [posts, deferredSearchQuery]);

  const paginationData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredData.length / ROWS_PER_PAGE));
    const start = (page - 1) * ROWS_PER_PAGE;
    const items = filteredData.slice(start, start + ROWS_PER_PAGE);
    return { totalPages, items };
  }, [filteredData, page]);

  const handlePageChange = useCallback((newPage: number) => {
    startTransition(() => setPage(newPage));
  }, []);

  const handleExportToExcel = useCallback(() => {
    const exportData = filteredData.map(p => ({
      Title: p.title,
      Slug: p.slug,
      Author: p.author?.name || "-",
      Category: p.category || "-",
      Tags: (p.tags ?? []).join(", "),
      Status: p.published ? "Published" : "Draft",
      "Published At": p.publishedAt ? new Date(p.publishedAt).toLocaleString("id-ID") : "",
      "Created At": p.createdAt ? new Date(p.createdAt).toLocaleString("id-ID") : "",
      "Updated At": p.updatedAt ? new Date(p.updatedAt).toLocaleString("id-ID") : "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 30 },
      { wch: 30 },
      { wch: 20 },
      { wch: 16 },
      { wch: 24 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Posts");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    XLSX.writeFile(wb, `posts_${timestamp}.xlsx`);
  }, [filteredData]);

  const onImported = useCallback(() => {
    router.refresh();
    onImportOpenChange();
  }, [router, onImportOpenChange]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold text-default-800 text-left">Posts</p>
                <Chip className="text-sm font-bold" color="success" radius="sm" size="sm" variant="flat">
                  {filteredData.length}
                </Chip>
              </div>
              <p className="text-small text-default-600">List All Posts</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="hidden sm:flex w-64"
              placeholder="Search posts..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              style={{ outline: "none" }}
              value={searchQuery}
              variant="flat"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.target.style.outline = "none"; }}
              onValueChange={handleSearchChange}
            />
            <Button className="flex-1 sm:flex-none" color="success" size="sm" startContent={<Upload className="w-4 h-4" />} variant="flat" onPress={handleExportToExcel}>
              Export
            </Button>
            <Button className="flex-1 sm:flex-none" color="warning" size="sm" startContent={<Download className="w-4 h-4" />} variant="flat" onPress={onImportOpen}>
              Import
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-0">
          <div className="px-6 pb-4 sm:hidden">
            <Input
              placeholder="Search posts..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              style={{ outline: "none" }}
              value={searchQuery}
              variant="flat"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.target.style.outline = "none"; }}
              onValueChange={handleSearchChange}
            />
          </div>

          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-default-300 mb-4" />
              <p className="text-default-500">{deferredSearchQuery ? "No posts found matching your search" : "No posts available"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                aria-label="Posts table"
                bottomContent={
                  paginationData.totalPages > 1 && (
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={paginationData.totalPages}
                        onChange={handlePageChange}
                      />
                    </div>
                  )
                }
              >
                <TableHeader>
                  <TableColumn>POST</TableColumn>
                  <TableColumn>AUTHOR</TableColumn>
                  {/* <TableColumn>CATEGORY</TableColumn> */}
                  <TableColumn>TAGS</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>CREATED</TableColumn>
                  <TableColumn>UPDATED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginationData.items.map((p) => {
                    const created = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "";
                    const updated = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "";
                    const publishedAt = p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : null;
                    const avatarSrc = p.author?.photo || p.author?.avatar || undefined;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1 truncate">
                            <span className="font-medium text-sm" title={p.title}>{p.title}</span>
                            {/* <p className="text-xs text-default-600 line-clamp-1" title={p.slug}>{p.slug}</p> */}
                              {p.published && publishedAt && (
                                <p className="text-[10px] text-default-500">Published: {publishedAt}</p>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <User
                            avatarProps={{ size: "sm", src: avatarSrc, className: "w-8 h-8 rounded-full object-cover flex-shrink-0" }}
                            classNames={{ name: "text-sm font-medium", description: "text-xs text-default-500", wrapper: "truncate" }}
                            // description={p.category || "No category"}
                            description={`Category: ${p.category || "No category"}`}
                            name={p.author?.name || "-"}
                          />
                        </TableCell>
                        {/* <TableCell>
                          <Chip className="capitalize" color="default" size="sm" variant="flat">
                            {p.category || "-"}
                          </Chip>
                        </TableCell> */}
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            {(p.tags ?? []).slice(0, 3).map((t) => (
                              <Chip key={t} size="sm" variant="flat" className="text-xs">{t}</Chip>
                            ))}
                            {(p.tags?.length ?? 0) > 3 && (
                              <Chip size="sm" variant="flat" className="text-xs">+{(p.tags?.length ?? 0) - 3}</Chip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip color={p.published ? "success" : "warning"} size="sm" variant="dot">
                            {p.published ? "Published" : "Draft"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-default-600">{created}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-default-600">{updated}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Post actions">
                                <DropdownItem key="view" startContent={<Eye className="w-4 h-4" />} onPress={() => router.push(`/dashboard/posts/${p.slug}`)}>
                                  View
                                </DropdownItem>
                                <DropdownItem key="edit" startContent={<Edit className="w-4 h-4" />} onPress={() => router.push(`/dashboard/posts/edit/${p.id}`)}>
                                  Edit
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  className="text-danger"
                                  color="danger"
                                  startContent={<Trash2 className="w-4 h-4" />}
                                  onPress={async () => {
                                    try {
                                      const ok = confirm("Delete this post?");
                                      if (!ok) return;
                                      const res = await fetch(`/api/dashboard/posts/${p.id}`, { method: 'DELETE' });
                                      if (!res.ok) throw new Error('Failed');
                                      router.refresh();
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }}
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mx-4">
        <Modal isOpen={isImportOpen} placement="top-center" size="3xl" onOpenChange={onImportOpenChange}>
          <ModalContent>
            {(onClose) => (
              <ImportPostsModal onImported={onImported} onClose={onClose} />
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
