import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

// Server Component: Unit List
async function UnitList() {
  const units = await prisma.unit.findMany({
    include: {
      category: true,
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="mt-8 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Unit List</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Serial Number</th>
            <th className="py-2 px-4 border-b">Location</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Created By</th>
            <th className="py-2 px-4 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr key={unit.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b text-center">{unit.name}</td>
              <td className="py-2 px-4 border-b text-center">
                {unit.serialNumber || "-"}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {unit.location}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {unit.category.name}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {unit.createdBy.name}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {unit.createdAt.toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Server Action: Add Unit
async function addUnit(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const serialNumber = formData.get("serialNumber") as string;
  const location = formData.get("location") as string;
  const categoryId = parseInt(formData.get("categoryId") as string);
  const createdById = formData.get("createdById") as string;

  try {
    await prisma.unit.create({
      data: {
        name,
        serialNumber,
        location,
        categoryId,
        createdById,
      },
    });

    revalidatePath("/dashboard/asset");

    return { success: true };
  } catch (error) {
    console.error("Error adding unit:", error);

    return { success: false, error: "Failed to add unit" };
  }
}

// Server Component: Add Unit Form
async function AddUnitForm() {
  const categories = await prisma.category.findMany();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add New Unit</h2>
      <form action={addUnit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="name"
            >
              Unit Name
            </label>
            <input
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              id="name"
              name="name"
              type="text"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="serialNumber"
            >
              Serial Number (Optional)
            </label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              id="serialNumber"
              name="serialNumber"
              type="text"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="location"
            >
              Location
            </label>
            <input
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              id="location"
              name="location"
              type="text"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="categoryId"
            >
              Category
            </label>
            <select
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              id="categoryId"
              name="categoryId"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <input name="createdById" type="hidden" value="" />

        <div>
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="submit"
          >
            Add Unit
          </button>
        </div>
      </form>
    </div>
  );
}

export default async function AssetPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Asset Management</h1>
      <AddUnitForm />
      <UnitList />
    </div>
  );
}
