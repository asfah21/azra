import prisma from "@/lib/prisma";

export default async function UserTable() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    return (
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Role</th>
              <th className="px-3 py-2 border">Department</th>
              <th className="px-3 py-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border">{user.name}</td>
                <td className="px-3 py-2 border">{user.email}</td>
                <td className="px-3 py-2 border">{user.role}</td>
                <td className="px-3 py-2 border">{user.department ?? "-"}</td>
                <td className="px-3 py-2 border">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No users found.</p>
        )}
      </div>
    );
  } catch (error) {
    console.error("Database error:", error);

    return (
      <div className="mt-6 p-4 bg-red-50 text-red-600 rounded border border-red-200">
        Unable to load users. Please try again later.
      </div>
    );
  }
}
