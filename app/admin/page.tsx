export default function Admin() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Statistik</h2>
          <p>Konten statistik atau metrik di sini.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Pengguna</h2>
          <p>Informasi pengguna aktif, baru, dll.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Log Aktivitas</h2>
          <p>Aktivitas terbaru admin atau pengguna.</p>
        </div>
      </div>
    </div>
  );
}
