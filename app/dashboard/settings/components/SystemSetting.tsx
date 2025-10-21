"use client";
import { Button } from "@heroui/react";
import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { addToast } from "@heroui/react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Database, Shield } from "lucide-react";

export default function SystemSetting() {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [trimmedDataURL, setTrimmedDataURL] = useState<string>("");
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch user signature (avatar) on mount
  useEffect(() => {
    async function fetchSignature() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();

        if (data?.profile?.avatar) {
          setSignatureUrl(data.profile.avatar);
        }
      } catch {}
      setLoading(false);
    }
    fetchSignature();
  }, []);

  // Helper: Convert dataURL to File
  function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(",");
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const handleSave = async () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

      setTrimmedDataURL(dataUrl);

      // Upload to server
      const file = dataURLtoFile(dataUrl, `signature-${Date.now()}.png`);
      const formData = new FormData();

      formData.append("signature", file);

      try {
        const res = await fetch("/api/settings/signature", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();

        if (result.success && result.signatureUrl) {
          setSignatureUrl(result.signatureUrl);
          addToast({
            title: "Berhasil",
            description: "Tanda tangan berhasil disimpan.",
            color: "success",
          });
        } else {
          addToast({
            title: "Gagal",
            description: result.message || "Gagal menyimpan tanda tangan.",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Terjadi kesalahan saat upload tanda tangan.",
          color: "danger",
        });
      }
    } else {
      addToast({
        title: "Tanda tangan kosong",
        description: "Silakan buat tanda tangan terlebih dahulu.",
        color: "warning",
      });
    }
  };

  const handleReset = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setTrimmedDataURL("");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-secondary-500 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold">System</p>
            <p className="text-small text-default-600">System Configuration</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          {/* Data Management */}
          <div className="space-y-3">
            <p className="font-medium text-small">Your Signature</p>
            <div className="space-y-2">
              {/* Digital Signature Box */}
              <div
                className="border border-dashed border-gray-400 rounded-md bg-white"
                style={{
                  height: 300,
                  width: 300,
                  position: "relative",
                  overflow: "hidden",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loading ? (
                  <span className="text-gray-400 text-sm">Loading...</span>
                ) : signatureUrl &&
                  signatureUrl !== "null" &&
                  signatureUrl !== "" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <img
                      alt="Signature"
                      className="max-h-full max-w-full object-contain mb-6"
                      src={signatureUrl}
                    />
                    <div className="w-full flex justify-center">
                      <Button
                        color="danger"
                        size="sm"
                        variant="bordered"
                        onPress={() => setSignatureUrl("")}
                      >
                        Ganti Tanda Tangan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <SignatureCanvas
                      ref={sigPadRef}
                      canvasProps={{
                        width: 300,
                        height: 300,
                        className: "w-full h-full bg-white cursor-crosshair",
                      }}
                      penColor="black"
                    />
                    {(!sigPadRef.current || sigPadRef.current.isEmpty()) && (
                      <span className="text-gray-400 text-sm absolute top-1 select-none pointer-events-none">
                        Tanda tangan disini
                      </span>
                    )}
                  </>
                )}
              </div>
              {!signatureUrl && (
                <div className="flex gap-2 mt-2">
                  <Button color="primary" size="sm" onPress={handleSave}>
                    Save
                  </Button>
                  <Button
                    color="default"
                    size="sm"
                    variant="bordered"
                    onPress={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              )}
              {trimmedDataURL && (
                <div className="mt-2">
                  {/* <p className="text-xs text-default-500 mb-1">Preview:</p>
                  <img src={trimmedDataURL} alt="Signature Preview" className="border rounded max-w-xs" /> */}
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Security */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <p className="font-medium text-small">Security</p>
            </div>
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                color="primary"
                size="sm"
                variant="flat"
              >
                Two-Factor Auth
              </Button>
              <Button
                className="w-full justify-start"
                color="default"
                size="sm"
                variant="flat"
              >
                Session Management
              </Button>
            </div>
          </div>
          <p className="text-xs text-warning">Feature not available yet</p>
        </CardBody>
      </Card>
    </>
  );
}
