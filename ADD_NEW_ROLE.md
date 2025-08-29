# Manajemen Role AZRA

Dokumen ini menjelaskan cara menambahkan dan mengelola role di sistem AZRA.

## 🔐 Daftar Role yang Tersedia

- `super_admin`: Akses penuh ke semua fitur sistem
- `admin_heavy`: Admin divisi heavy equipment
- `admin_elec`: Admin divisi electrical
- `pengawas`: Supervisor/pengawas lapangan
- `mekanik`: Teknisi/mekanik
- `guest`: Akses terbatas (hanya baca)

## 🛠️ Cara Menambahkan Role Baru

### 1. Update Schema Database

Buka file `prisma/schema.prisma` dan tambahkan role baru ke dalam enum [Role](cci:2://file:///d:/PAM-PROJECT/azra/lib/utils/roleAccess.ts:3:0-3:92):

```prisma
enum Role {
  super_admin
  admin_heavy
  admin_elec
  pengawas
  mekanik
  guest
  // Contoh role baru:
  admin_hrd  // Role baru yang akan ditambahkan
}

2. Update Tipe TypeScript
Update tipe role di lib/types/next-auth.d.ts:

typescript
declare module "next-auth" {
  interface User {
    role: 'super_admin' | 'admin_heavy' | 'admin_elec' | 
           'pengawas' | 'mekanik' | 'guest' | 'admin_hrd';  // Tambahkan role baru di sini
  }
}

### 3. Update Middleware
Tambahkan role baru ke route yang sesuai di 
middleware.ts
d:\PAM-PROJECT\azra\middleware.ts
:

typescript
{
  path: "/dashboard/hr",  // Contoh route baru
  allowedRoles: ['super_admin', 'admin_hrd']  // Role yang diizinkan
}
4. Update Halaman Manajemen Role
Tambahkan role baru ke daftar role di 
app/dashboard/auth/page.tsx
:

typescript
const roles = [
  // role yang sudah ada...
  { id: 7, name: 'Admin HRD', role: 'admin_hrd' }  // role baru
];
5. Update Konfigurasi Navigasi
Tambahkan role baru ke menu yang sesuai di 
lib/config/navigation.ts
:

typescript
{
  id: 'hr',
  title: 'HR',
  path: '/dashboard/hr',
  icon: 'FiUsers',
  roles: ['super_admin', 'admin_hrd']  // Role yang bisa mengakses
}
6. Jalankan Migrasi
bash
npx prisma migrate dev --name add_admin_hrd_role
7. Update Pengguna yang Ada (Opsional)
Jika perlu, update pengguna yang sudah ada ke role baru melalui:

Prisma Studio
Script migrasi
Atau langsung melalui database
🔄 Cara Kerja Sistem Role
Autentikasi & Otorisasi:
Setiap request ke route yang dilindungi akan diverifikasi oleh middleware
Hanya role yang terdaftar di allowedRoles yang bisa mengakses route tertentu
Manajemen Akses:
Halaman /dashboard/auth hanya bisa diakses oleh super_admin
Setiap menu di sidebar akan difilter berdasarkan role user yang login
Pengaturan akses disimpan di localStorage dengan key roleAccess
Default Access:
super_admin selalu memiliki akses penuh ke semua fitur
Role lain hanya bisa mengakses menu yang diizinkan
🚨 Troubleshooting
Role tidak muncul di halaman auth:
Pastikan role sudah ditambahkan di 
app/dashboard/auth/page.tsx
Periksa console browser untuk error JavaScript
Akses ditolak padahal sudah diatur:
Pastikan sudah melakukan migrasi database
Periksa konfigurasi di 
middleware.ts
Pastikan user sudah login dengan role yang benar
Perubahan tidak tersimpan:
Pastikan sudah menekan tombol "Simpan Perubahan"
Periksa localStorage browser untuk memastikan data tersimpan