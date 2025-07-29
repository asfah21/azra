"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Avatar,
  Input,
  Button,
  addToast,
} from "@heroui/react";
import { Image, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { useState, useEffect } from "react";

import ChangePhotoModal from "./ChangePhotoModal";

import { useUpdateProfile, useUpdatePhoto } from "@/hooks/useSettings";

export default function ProfileSetting({ profile }: { profile: any }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    workOrders: true,
    maintenance: true,
    alerts: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(30);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [department, setDepartment] = useState(profile?.department || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [location, setLocation] = useState(profile?.location || "");
  // const [photo, setPhoto] = useState(profile?.photo || "https://i.pravatar.cc/150?img=12");
  const [photo, setPhoto] = useState(profile?.photo || null);

  // React Query mutations
  const updateProfileMutation = useUpdateProfile();
  const updatePhotoMutation = useUpdatePhoto();

  useEffect(() => {
    setName(profile?.name || "");
    setDepartment(profile?.department || "");
    setEmail(profile?.email || "");
    setPhone(profile?.phone || "");
    setLocation(profile?.location || "");
    setPhoto(profile?.photo || "https://i.pravatar.cc/150?img=12");
  }, [profile]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await updateProfileMutation.mutateAsync({
        phone,
      });

      if (result.success) {
        addToast({
          title: "Berhasil Disimpan",
          description: result.message || "Data profil berhasil diperbarui.",
          color: "success",
        });
      } else {
        addToast({
          title: "Gagal Menyimpan",
          description: result.message || "Gagal memperbarui data profil.",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data.",
        color: "danger",
      });
    }
  };

  const handlePhotoUpdate = async (file: File) => {
    if (file.size > 1024 * 1024) {
      addToast({
        title: "Ukuran gambar terlalu besar",
        description: "Ukuran gambar maksimal 1MB.",
        color: "danger",
      });

      return;
    }

    try {
      const result = await updatePhotoMutation.mutateAsync({
        photo: file,
      });

      if (result.success) {
        addToast({
          title: "Berhasil",
          description: result.message || "Foto berhasil diupdate.",
          color: "success",
        });

        if (result.photoUrl) {
          setPhoto(result.photoUrl);
        }

        setShowPhotoModal(false);
      } else {
        addToast({
          title: "Gagal",
          description: result.message || "Gagal mengupdate foto.",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error updating photo:", error);
      addToast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate foto.",
        color: "danger",
      });
    }
  };

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-primary-500 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold">Setting Profile</p>
            <p className="text-small text-default-600">Update data diri anda</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Profile Picture & Basic Info */}
            <div className="sm:flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20" src={photo} />
              <div className="py-3 sm:flex-1 sm:space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    disabled
                    label="Nama Lengkap"
                    placeholder="Enter your name"
                    size="sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    disabled
                    label="Department"
                    placeholder="Enter your department"
                    size="sm"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                <Button
                  className="mt-2"
                  color="success"
                  isLoading={updatePhotoMutation.isPending}
                  size="sm"
                  startContent={<Image className="w-4 h-4" />}
                  type="button"
                  onPress={() => setShowPhotoModal(true)}
                >
                  Ganti Foto
                </Button>
              </div>
            </div>

            {/* Modal untuk Change Photo */}
            <ChangePhotoModal
              isOpen={showPhotoModal}
              onClose={() => setShowPhotoModal(false)}
              onPhotoUploaded={handlePhotoUpdate}
            />

            {/* Contact Information */}
            <div className="space-y-3 mt-4">
              <h4 className="font-semibold text-default-700">
                Informasi Kontak
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  disabled
                  label="Email"
                  placeholder="your@email.com"
                  size="sm"
                  startContent={<Mail className="w-4 h-4 text-default-400" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  color="success"
                  label="Telp"
                  maxLength={16}
                  pattern="^\+?[0-9]{0,15}$"
                  placeholder="+62 xxx xxxx xxxx"
                  size="sm"
                  startContent={<Phone className="w-4 h-4 text-default-400" />}
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    let value = e.target.value;

                    value = value.replace(/[^0-9+]/g, "");
                    if (value.startsWith("+")) {
                      value = "+" + value.slice(1).replace(/\+/g, "");
                    } else {
                      value = value.replace(/\+/g, "");
                    }
                    setPhone(value);
                  }}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-default-700">
                Informasi Lokasi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  disabled
                  label="Lokasi"
                  placeholder="Enter your location"
                  size="sm"
                  startContent={<MapPin className="w-4 h-4 text-default-400" />}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                color="primary"
                isLoading={updateProfileMutation.isPending}
                startContent={<Save className="w-4 h-4" />}
                type="submit"
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
