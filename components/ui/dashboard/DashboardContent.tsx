"use client";

import { Card, CardHeader, CardBody, Divider, Chip, Button, User, Progress } from "@heroui/react";
import { LayoutDashboardIcon, Activity, Clock, CheckCircle2, AlertTriangle, Mail, Shield, Package, Wrench, TrendingUp } from "lucide-react";
import DashboardCharts from "@/components/ui/dashboard/DashboardCharts";
import { DashboardSkeleton } from "@/components/ui/skeleton";

interface DashboardContentProps {
  user: any;
  dashboardData: {
    assetStats: {
      total: number;
      active: number;
      maintenance: number;
      critical: number;
    };
    workOrderStats: {
      total: number;
      pending: number;
      inProgress: number;
      rfu: number;
      overdue: number;
    };
    monthlyBreakdowns: Array<{ month: string; count: number }>;
    categoryDistribution: Array<{ category: string; count: number }>;
    maintenancePerformance: Array<{
      department: string;
      completionRate: number;
    }>;
  };
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    avatar: string;
    type: string;
    createdAt: Date;
  }>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function DashboardContent({
  user,
  dashboardData = {
    assetStats: { total: 0, active: 0, maintenance: 0, critical: 0 },
    workOrderStats: { total: 0, pending: 0, inProgress: 0, rfu: 0, overdue: 0 },
    monthlyBreakdowns: [],
    categoryDistribution: [],
    maintenancePerformance: [],
  },
  recentActivities = [],
  loading = false,
  error = null,
  onRetry,
}: DashboardContentProps) {
  // PERBAIKAN: Handle loading state dengan overlay
  if (loading) {
    return (
      <div>
        {/* Loading overlay */}
        {/* <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-small text-default-500">Loading dashboard data...</p>
          </div>
        </div> */}

        {/* Render skeleton content */}
        <DashboardSkeleton />
      </div>
    );
  }

  // PERBAIKAN: Handle error state dengan retry button
  if (error) {
    return (
      <div>        
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-danger mb-2">Error loading dashboard:</p>
            <p className="text-small text-default-500 mb-4">{error}</p>
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
              onClick={onRetry}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PERBAIKAN: Selalu render content dengan data yang ada
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "asset":
        return <Package className="w-3 h-3" />;
      case "work_order":
        return <Wrench className="w-3 h-3" />;
      case "maintenance":
        return <CheckCircle2 className="w-3 h-3" />;
      case "alert":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "asset":
        return "primary";
      case "work_order":
        return "warning";
      case "maintenance":
        return "success";
      case "alert":
        return "danger";
      default:
        return "default";
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "asset":
        return "Asset";
      case "work_order":
        return "Work Order";
      case "maintenance":
        return "Maintenance";
      case "alert":
        return "Alert";
      default:
        return "Activity";
    }
  };

  return (
    <div>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Assets */}
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-primary-800">
                Total Assets
              </p>
              <p className="text-small text-primary-600">All Equipment</p>
            </div>
          </CardHeader>
          <Divider className="bg-primary-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary-700">
                  {dashboardData?.assetStats?.total || 0}
                </span>
                <Chip color="primary" size="sm" variant="flat">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.2%
                </Chip>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-default-600">
                    Growth Rate
                  </span>
                  <span className="text-small font-medium">5.2%</span>
                </div>
                <Progress
                  className="max-w-full"
                  color="primary"
                  size="sm"
                  value={85}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Active Assets */}
        <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-success-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-success-800">
                Active Assets
              </p>
              <p className="text-small text-success-600">Operational</p>
            </div>
          </CardHeader>
          <Divider className="bg-success-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-success-700">
                  {dashboardData?.assetStats?.active || 0}
                </span>
                <Chip color="success" size="sm" variant="flat">
                  On
                </Chip>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-default-600">
                    Availability
                  </span>
                  <span className="text-small font-medium">
                    {dashboardData?.assetStats?.total
                      ? Math.round(
                          (dashboardData?.assetStats?.active /
                            dashboardData?.assetStats?.total) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  className="max-w-full"
                  color="success"
                  size="sm"
                  value={
                    dashboardData?.assetStats?.total
                      ? (dashboardData?.assetStats?.active /
                          dashboardData?.assetStats?.total) *
                        100
                      : 0
                  }
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Work Orders */}
        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-warning-500 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-warning-800">
                Work Orders
              </p>
              <p className="text-small text-warning-600">Active Breakdowns</p>
            </div>
          </CardHeader>
          <Divider className="bg-warning-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-warning-700">
                  {dashboardData?.workOrderStats?.total || 0}
                </span>
                <Chip color="warning" size="sm" variant="flat">
                  Active
                </Chip>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-default-600">
                    Completion Rate
                  </span>
                  <span className="text-small font-medium">
                    {dashboardData?.workOrderStats?.total
                      ? Math.round(
                          (dashboardData?.workOrderStats?.rfu /
                            dashboardData?.workOrderStats?.total) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  className="max-w-full"
                  color="warning"
                  size="sm"
                  value={
                    dashboardData?.workOrderStats?.total
                      ? (dashboardData?.workOrderStats?.rfu /
                          dashboardData?.workOrderStats?.total) *
                        100
                      : 0
                  }
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Critical Assets */}
        <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-danger-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-danger-800">
                Critical Assets
              </p>
              <p className="text-small text-danger-600">Need Attention</p>
            </div>
          </CardHeader>
          <Divider className="bg-danger-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-danger-700">
                  {dashboardData?.assetStats?.critical || 0}
                </span>
                <Chip color="danger" size="sm" variant="flat">
                  Alert
                </Chip>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-default-600">
                    Risk Level
                  </span>
                  <span className="text-small font-medium">
                    {dashboardData?.assetStats?.total
                      ? Math.round(
                          (dashboardData?.assetStats?.critical /
                            dashboardData?.assetStats?.total) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  className="max-w-full"
                  color="danger"
                  size="sm"
                  value={
                    dashboardData?.assetStats?.total
                      ? (dashboardData?.assetStats?.critical /
                          dashboardData?.assetStats?.total) *
                        100
                      : 0
                  }
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts
        assetStats={
          dashboardData?.assetStats || {
            total: 0,
            active: 0,
            maintenance: 0,
            critical: 0,
          }
        }
        categoryDistribution={dashboardData?.categoryDistribution || []}
        maintenancePerformance={dashboardData?.maintenancePerformance || []}
        monthlyBreakdowns={dashboardData?.monthlyBreakdowns || []}
        workOrderStats={
          dashboardData?.workOrderStats || {
            total: 0,
            pending: 0,
            inProgress: 0,
            rfu: 0,
            overdue: 0,
          }
        }
      />

      {/* User Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* User Name Card */}
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-primary-800">
                User Name
              </p>
              <p className="text-small text-primary-600">
                Personal Information
              </p>
            </div>
          </CardHeader>
          <Divider className="bg-primary-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-default-700">Name</span>
                <Chip color="primary" size="sm" variant="flat">
                  {user.name}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-700">Status</span>
                <Chip color="success" size="sm" variant="flat">
                  Active
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* User Role Card */}
        <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-success-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-success-800">
                User Role
              </p>
              <p className="text-small text-success-600">Access Level</p>
            </div>
          </CardHeader>
          <Divider className="bg-success-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-default-700">Role</span>
                <span className="text-lg font-bold text-success-700 capitalize">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-sm text-default-700">ID : {user.id}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Email Card */}
        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-warning-500 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-warning-800">
                Email Address
              </p>
              <p className="text-small text-warning-600">Account Information</p>
            </div>
          </CardHeader>
          <Divider className="bg-warning-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-default-700">Email</span>
                <Chip color="warning" size="sm" variant="flat">
                  {user.email}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-700">Status</span>
                <Chip color="success" size="sm" variant="flat">
                  Active
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activities Detail */}
      <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-secondary-500 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xl font-semibold text-secondary-800">
              Aktivitas Terbaru
            </p>
            <p className="text-small text-secondary-600">
              Aktivitas sistem dan user
            </p>
          </div>
          <Button
            color="secondary"
            endContent={<Activity className="w-4 h-4" />}
            size="sm"
            variant="flat"
          >
            Lihat Semua
          </Button>
        </CardHeader>
        <Divider className="bg-secondary-200" />
        <CardBody className="px-6 py-4">
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary-100 transition-colors"
                >
                  {/* <Avatar
                    isBordered
                    color={getActivityColor(activity.type) as any}
                    size="md"
                    src={activity.avatar}
                  /> */}
                  <div className="flex-1">
                    <User
                      classNames={{
                        name: "font-semibold text-default-700",
                        description: "text-default-500",
                      }}
                      description={activity.action}
                      name={activity.user}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <Chip
                      color={getActivityColor(activity.type) as any}
                      size="sm"
                      variant="flat"
                    >
                      {getActivityLabel(activity.type)}
                    </Chip>
                    <Chip
                      color="default"
                      size="sm"
                      startContent={<Clock className="w-3 h-3" />}
                      variant="flat"
                    >
                      {activity.time}
                    </Chip>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-default-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-default-400" />
                <p>Tidak ada aktivitas terbaru</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
