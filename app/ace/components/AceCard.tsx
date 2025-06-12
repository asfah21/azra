"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { Users, UserCheck, UserPlus } from "lucide-react";

interface UserStats {
  total: number;
  new: number;
}

interface UserStatsCardsProps {
  totalCount: UserStats;
}

export default function AceCards({ totalCount }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Card Total Users */}
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Total Users</p>
            <p className="text-small text-default-500">All registered users</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-primary">
              {totalCount.total.toLocaleString()}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Card Active Users */}
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
            <UserCheck className="w-5 h-5 text-success" />
          </div>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Active Users</p>
            <p className="text-small text-default-500">
              Active in last 30 days
            </p>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-success">
              <p>World</p>
            </span>
            <div className="text-small text-default-500">
              <p>Halo</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Card New Users */}
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
            <UserPlus className="w-5 h-5 text-warning" />
          </div>
          <div className="flex flex-col">
            <p className="text-md font-semibold">New Users</p>
            <p className="text-small text-default-500">Registered this month</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-warning">
              {totalCount.new.toLocaleString()}
            </span>
            <div className="text-small text-default-500">This month</div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
