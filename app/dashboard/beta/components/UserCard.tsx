'use client';
import { Card, CardHeader } from '@heroui/react'
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    count: number;
};

export default function UserCard({ count }: Props) {
    const [liveCount, setLiveCount] = useState(count);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    useEffect(() => {
        const eventSource = new EventSource('/api/beta');
        
        eventSource.onopen = () => {
            setIsConnected(true);
            console.log('SSE connected');
        };
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLiveCount(data.count);
            setLastUpdate(new Date());
            console.log('Received updated data:', data.count);
        };

        eventSource.onerror = (error) => {
            setIsConnected(false);
            console.error('SSE error:', error);
        };

        return () => {
            eventSource.close();
            setIsConnected(false);
            console.log('SSE disconnected');
        };
    }, []);

    return (
        <Card className="p-4 shadow-md rounded-2xl bg-white">
            <CardHeader className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm text-gray-500">Total Users</div>
                    <div className="text-xl font-bold text-gray-800">{liveCount}</div>
                    {isConnected && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Live
                        </div>
                    )}
                    {lastUpdate && (
                        <div className="text-xs text-gray-400">
                            Updated: {lastUpdate.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </CardHeader>
        </Card>
    );
}