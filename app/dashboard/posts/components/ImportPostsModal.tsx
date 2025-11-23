"use client";
import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Progress,
} from "@heroui/react";
import * as XLSX from "xlsx";

interface ImportPostsModalProps {
  onImported: () => void;
  onClose: () => void;
}

type ParsedRow = {
  title?: string;
  slug?: string;
  content?: string;
  description?: string;
  coverImage?: string;
  images?: string[];
  tags?: string[];
  category?: string | null;
  link?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  authorEmail?: string | null;
};

export default function ImportPostsModal({
  onImported,
  onClose,
}: ImportPostsModalProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = useCallback(() => {
    const headerSheet = [
      {
        Title: "Welcome to Our Blog",
        Slug: "welcome-to-our-blog",
        Content: "Your content here...",
        Description: "Short description (optional)",
        CoverImage: "https://example.com/cover.jpg",
        Images: "https://example.com/img1.jpg, https://example.com/img2.jpg",
        Tags: "news,intro,update",
        Category: "Announcements",
        Link: "https://example.com/read-more",
        Published: "true/false",
        PublishedAt: "2025-01-10T08:00:00Z",
        MetaTitle: "SEO Title (optional)",
        MetaDescription: "SEO Description (optional)",
        AuthorEmail: "author@example.com",
      },
    ];

    const examples = [
      {
        Title: "Welcome to Our Blog",
        Slug: "welcome-to-our-blog",
        Content: "This is the first post content.",
        Description: "Introductory post",
        CoverImage: "https://example.com/cover1.jpg",
        Images: "https://example.com/imgA.jpg\nhttps://example.com/imgB.jpg",
        Tags: "news,intro,update",
        Category: "Announcements",
        Link: "https://example.com/welcome",
        Published: true,
        PublishedAt: "2025-01-10T08:00:00Z",
        MetaTitle: "Welcome | My Blog",
        MetaDescription: "A welcome post to introduce our blog.",
        AuthorEmail: "author1@example.com",
      },
      {
        Title: "Cricut Beginner Guide",
        Slug: "cricut-beginner-guide",
        Content: "Step-by-step guide for Cricut beginners.",
        Description: "Learn Cricut basics",
        CoverImage: "",
        Images: "",
        Tags: "Cricut,DIY,Crafting",
        Category: "Tutorials",
        Link: "",
        Published: false,
        PublishedAt: "",
        MetaTitle: "Cricut Guide for Beginners",
        MetaDescription: "Essential tips to start with Cricut.",
        AuthorEmail: "author2@example.com",
      },
    ];

    const wsHeader = XLSX.utils.json_to_sheet(headerSheet);
    const wsExamples = XLSX.utils.json_to_sheet(examples);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, wsHeader, "Template Posts");
    XLSX.utils.book_append_sheet(wb, wsExamples, "Contoh Data");

    XLSX.writeFile(wb, "template_import_posts.xlsx");
  }, []);

  const handleFile = useCallback(async (file?: File) => {
    setError(null);
    if (!file) {
      setRows([]);

      return;
    }
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const mapped: ParsedRow[] = json.map((r) => {
        const tags =
          typeof r.Tags === "string"
            ? r.Tags.split(/[\n,]/)
                .map((t: string) => t.trim())
                .filter(Boolean)
            : Array.isArray(r.Tags)
              ? r.Tags
              : [];
        const images =
          typeof r.Images === "string"
            ? r.Images.split(/[\n,]/)
                .map((t: string) => t.trim())
                .filter(Boolean)
            : Array.isArray(r.Images)
              ? r.Images
              : [];

        return {
          title: r.Title || r.title,
          slug: r.Slug || r.slug,
          content: r.Content || r.content,
          description: r.Description || r.description || "",
          coverImage: r.CoverImage || r.coverImage || "",
          images,
          tags,
          category: r.Category || r.category || null,
          link: r.Link || r.link || null,
          published:
            typeof r.Published === "string"
              ? /^(true|1|published|yes)$/i.test(r.Published)
              : !!r.Published,
          publishedAt:
            r.PublishedAt || r["Published At"] || r.publishedAt || "",
          metaTitle: r.MetaTitle || r.metaTitle || null,
          metaDescription: r.MetaDescription || r.metaDescription || null,
          authorEmail: r.AuthorEmail || r.authorEmail || null,
        };
      });

      setRows(mapped);
    } catch (e: any) {
      console.error(e);
      setError(
        "Failed to parse file. Use .xlsx/.csv with headers: Title, Slug, Content, (optional others)",
      );
    }
  }, []);

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  const handleImport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = rows.filter((r) => r.title && r.slug && r.content);

      if (payload.length === 0) {
        setError("No valid rows. Require Title, Slug, Content.");
        setLoading(false);

        return;
      }
      const res = await fetch("/api/dashboard/posts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: payload }),
      });

      if (!res.ok) throw new Error(await res.text());
      onImported();
      onClose();
    } catch (e: any) {
      console.error(e);
      setError("Import failed.");
    } finally {
      setLoading(false);
    }
  }, [rows, onImported, onClose]);

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-lg font-semibold">Import Posts</p>
            <p className="text-sm text-default-500">
              Upload Excel (.xlsx) with headers: Title, Slug, Content,
              Description, CoverImage, Images, Tags, Category, Link, Published,
              PublishedAt, MetaTitle, MetaDescription, AuthorEmail
            </p>
          </div>

          <Card className="border-primary-200 bg-primary-50">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-primary-800">
                    Download Template Excel
                  </h3>
                  <p className="text-xs text-primary-600 mt-1">
                    Download template for correct data format
                  </p>
                </div>
                <Button
                  color="primary"
                  size="sm"
                  variant="flat"
                  onPress={downloadTemplate}
                >
                  Template
                </Button>
              </div>
            </CardBody>
          </Card>

          <div className="flex gap-2 flex-wrap">
            <Input
              accept=".xlsx,.xls,.csv"
              className="flex-1"
              type="file"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Divider />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Chip color="primary" size="sm" variant="flat">
                Rows: {rows.length}
              </Chip>
              <Chip color="success" size="sm" variant="flat">
                Valid:{" "}
                {rows.filter((r) => r.title && r.slug && r.content).length}
              </Chip>
            </div>
            {loading && (
              <Progress
                isIndeterminate
                aria-label="Importing"
                className="w-32"
                size="sm"
              />
            )}
          </div>
          {preview.length > 0 && (
            <div className="text-xs text-default-600">
              <p className="font-medium mb-2">Preview (first 5 rows)</p>
              <ul className="list-disc pl-5 space-y-1">
                {preview.map((r, i) => (
                  <li key={i}>
                    <span className="font-medium">{r.title}</span> — {r.slug}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={rows.length === 0}
              isLoading={loading}
              onPress={handleImport}
            >
              Import
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
