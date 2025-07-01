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
import {
  Eye,
  EyeOff,
  Image,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

import { updateProfile, updatePhoto } from "../action";

import ChangePhotoModal from "./ChangePhotoModal";

export default function ProfileSetting({
  profile,
  userId,
}: {
  profile: any;
  userId: string;
}) {
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
  const [photo, setPhoto] = useState(
    profile?.photo || "https://i.pravatar.cc/150?img=12",
  );

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
    await updateProfile(userId, {
      name,
      department,
      email,
      phone,
      location,
    });
    addToast({
      title: "Berhasil Disimpan",
      description: "Data profil berhasil diperbarui.",
      color: "success",
    });
  };

  const handlePhotoUpdate = async (file: File) => {
    const formData = new FormData();

    formData.append("photo", file);
    await updatePhoto(userId, formData);
    setShowPhotoModal(false);
  };

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-primary-500 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold">Profile Settings</p>
            <p className="text-small text-default-600">
              Update your personal information
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Profile Picture & Basic Info */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20" src={photo} />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    size="sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Department"
                    placeholder="Enter your department"
                    size="sm"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                <Button
                  color="success"
                  size="sm"
                  startContent={<Image className="w-4 h-4" />}
                  type="button"
                  onPress={() => setShowPhotoModal(true)}
                >
                  Change Image
                </Button>
              </div>
            </div>

            {/* Modal untuk Change Photo */}
            <ChangePhotoModal
              isOpen={showPhotoModal}
              updatePhoto={updatePhoto}
              userId={userId}
              onClose={() => setShowPhotoModal(false)}
            />

            {/* Contact Information */}
            <div className="space-y-3 mt-4">
              <h4 className="font-semibold text-default-700">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  size="sm"
                  startContent={<Mail className="w-4 h-4 text-default-400" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Phone"
                  placeholder="+62 xxx xxxx xxxx"
                  size="sm"
                  startContent={<Phone className="w-4 h-4 text-default-400" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Input
                label="Location"
                placeholder="Your work location"
                size="sm"
                startContent={<MapPin className="w-4 h-4 text-default-400" />}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Password Settings */}
            <div className="space-y-3 mt-6">
              <h4 className="font-semibold text-default-700">Security</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  endContent={
                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  label="Current Password"
                  placeholder="Enter current password"
                  size="sm"
                  type={showPassword ? "text" : "password"}
                />
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  size="sm"
                  type="password"
                />
              </div>
            </div>
            {/* Tombol Save */}
            <div className="mt-6 mb-2 flex justify-end">
              <Button
                color="primary"
                size="sm"
                startContent={<Save className="w-4 h-4" />}
                type="submit"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
