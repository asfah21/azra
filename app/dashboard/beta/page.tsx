import { getUserList, getUserCount } from '@/lib/dashboard/beta'
import { createUser, deleteUser } from './action'
import UserTable from './components/UserTable'
import UserForm from './components/UserForm'
import UserCard from './components/UserCard'

export default async function BetaPage() {
    const [users, count] = await Promise.all([
        getUserList(),
        getUserCount(),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">User Dashboard</h1>

            {/* User Card */}
            <UserCard count={count} />

            {/* Form dan Table */}
            <UserForm action={createUser} />
            <UserTable users={users} onDelete={deleteUser} />
        </div>
    );
} 