'use client';
import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Input, 
  Button, 
  Select, 
  SelectItem,
  Divider
} from '@heroui/react';
import { UserPlus, Loader2 } from 'lucide-react';

type Role = 'super_admin' | 'admin_heavy' | 'admin_elec' | 'pengawas' | 'mekanik';

const roleOptions: { value: Role; label: string }[] = [
  { value: 'mekanik', label: 'Mekanik' },
  { value: 'pengawas', label: 'Pengawas' },
  { value: 'admin_elec', label: 'Admin' },
  { value: 'admin_heavy', label: 'Admin PAM' },
  { value: 'super_admin', label: 'Super Admin' },
];

export default function UserForm({ action }: { action: (fd: FormData) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mekanik' as Role
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataObj = new FormData();
    formDataObj.append('name', formData.name);
    formDataObj.append('email', formData.email);
    formDataObj.append('password', formData.password);
    formDataObj.append('role', formData.role);

    try {
      await action(formDataObj);
      // Reset form setelah berhasil
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'mekanik'
      });
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
          <UserPlus className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Tambah User Baru</h3>
          <p className="text-sm text-gray-500">Buat akun user baru</p>
        </div>
      </CardHeader>
      
      <Divider />
      
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            isRequired
            isDisabled={isLoading}
            variant="bordered"
            size="sm"
          />

          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            isRequired
            isDisabled={isLoading}
            variant="bordered"
            size="sm"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimal 6 karakter"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            isRequired
            isDisabled={isLoading}
            variant="bordered"
            size="sm"
            minLength={6}
          />

          <Select
            label="Role"
            placeholder="Pilih role user"
            selectedKeys={[formData.role]}
            onChange={(e) => handleInputChange('role', e.target.value as Role)}
            isDisabled={isLoading}
            variant="bordered"
            size="sm"
          >
            {roleOptions.map((role) => (
              <SelectItem key={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </Select>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isLoading}
            startContent={!isLoading && <UserPlus className="w-4 h-4" />}
            isDisabled={!formData.name || !formData.email || !formData.password}
          >
            {isLoading ? 'Menambahkan...' : 'Tambah User'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
