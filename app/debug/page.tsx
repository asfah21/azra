import { NextResponse } from "next/server";

export default async function DebugPage() {
  const testDbConnection = async () => {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/test-db`, {
        cache: 'no-store'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: "Failed to test database connection" };
    }
  };

  const dbResult = await testDbConnection();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
      
      <div className="grid gap-6">
        {/* Environment Variables */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}
            </div>
            <div>
              <strong>DATABASE_URL:</strong> {process.env.DATABASE_URL ? 'Set' : 'Not set'}
            </div>
            <div>
              <strong>POSTGRES_URL_NON_POOLING:</strong> {process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set'}
            </div>
            <div>
              <strong>NEXTAUTH_SECRET:</strong> {process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}
            </div>
            <div>
              <strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || 'Not set'}
            </div>
          </div>
        </div>

        {/* Database Connection Test */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
          <div className="space-y-2">
            <div>
              <strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                dbResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {dbResult.success ? 'Connected' : 'Failed'}
              </span>
            </div>
            <div>
              <strong>Message:</strong> {dbResult.message}
            </div>
            {dbResult.timestamp && (
              <div>
                <strong>Timestamp:</strong> {dbResult.timestamp}
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Tips</h2>
          <div className="space-y-3">
            <div>
              <strong>1. Database Connection:</strong>
              <ul className="ml-4 mt-1 list-disc">
                <li>Pastikan DATABASE_URL terkonfigurasi dengan benar di Vercel</li>
                <li>Pastikan database PostgreSQL berjalan dan dapat diakses</li>
                <li>Periksa firewall dan network settings</li>
              </ul>
            </div>
            <div>
              <strong>2. Environment Variables:</strong>
              <ul className="ml-4 mt-1 list-disc">
                <li>Pastikan semua environment variables ter-set di Vercel dashboard</li>
                <li>Restart deployment setelah mengubah environment variables</li>
                <li>Periksa format URL database (postgresql://user:pass@host:port/db)</li>
              </ul>
            </div>
            <div>
              <strong>3. Authentication:</strong>
              <ul className="ml-4 mt-1 list-disc">
                <li>Pastikan NEXTAUTH_SECRET ter-set dengan nilai yang unik</li>
                <li>Pastikan NEXTAUTH_URL ter-set dengan URL production yang benar</li>
                <li>Periksa apakah ada user di database dengan email dan password yang benar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 