'use client';
import { Card } from "@heroui/react"
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function UserTable({ users, onDelete }: {
  users: User[];
  onDelete: (id: string) => void;
}) {
  const [liveUsers, setLiveUsers] = useState(users);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/beta');
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE connected for table');
    };
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveUsers(data.users);
      setLastUpdate(new Date());
      console.log('Table updated with', data.users.length, 'users');
    };

    eventSource.onerror = (error) => {
      setIsConnected(false);
      console.error('SSE table error:', error);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  return (
    <div>
      {isConnected && (
        <div className="mb-2 text-xs text-green-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Updates
        </div>
      )}
      {lastUpdate && (
        <div className="mb-2 text-xs text-gray-400">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
      
      <Card className="p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {liveUsers.map(user => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <form action={() => onDelete(user.id)}>
                    <button 
                      type="submit"
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
