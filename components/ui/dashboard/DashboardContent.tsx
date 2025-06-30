"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Button,
  User,
  Progress,
} from "@heroui/react";
import {
  LayoutDashboardIcon,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Shield,
  Package,
  Wrench,
  TrendingUp,
} from "lucide-react";

import DashboardCharts from "@/components/ui/dashboard/DashboardCharts";
import { useDashboard } from "@/app/dashboard/hooks/useDashboard";

interface DashboardContentProps {
  user: any;
  initialDashboardData: {
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
    monthlyBreakdowns: Array<{
      month: string;
      count: number;
    }>;
    categoryDistribution: Array<{
      category: string;
      count: number;
    }>;
    maintenancePerformance: Array<{
      department: string;
      completionRate: number;
    }>;
  };
  initialRecentActivities: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    avatar: string;
    type: string;
    createdAt: Date;
  }>;
}

export default function DashboardContent({
  user,
  initialDashboardData,
  initialRecentActivities,
}: DashboardContentProps) {
  // State untuk mencegah flickering
  const [isClient, setIsClient] = useState(false);
  
  // Gunakan hook untuk real-time updates
  const { dashboardData, recentActivities, isLoading, error } = useDashboard();

  // Mencegah hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Gunakan initial data sampai client-side hydration selesai
  const currentDashboardData = (!isClient || isLoading || error) 
    ? initialDashboardData 
    : dashboardData;
    
  const currentRecentActivities = (!isClient || isLoading || error) 
    ? initialRecentActivities 
    : recentActivities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <UserIcon className="w-4 h-4 text-success" />;
      case "breakdown":
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case "workorder":
        return <Wrench className="w-4 h-4 text-primary" />;
      case "maintenance":
        return <Activity className="w-4 h-4 text-secondary" />;
      case "asset":
        return <Package className="w-4 h-4 text-warning" />;
      case "rfu":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      default:
        return <Activity className="w-4 h-4 text-default" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "login":
        return "success";
      case "breakdown":
        return "danger";
      case "workorder":
        return "primary";
      case "maintenance":
        return "secondary";
      case "asset":
        return "warning";
      case "rfu":
        return "success";
      default:
        return "default";
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "login":
        return "Login";
      case "breakdown":
        return "Breakdown";
      case "workorder":
        return "Work Order";
      case "maintenance":
        return "Maintenance";
      case "asset":
        return "Asset";
      case "rfu":
        return "RFU";
      default:
        return "Activity";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
          <LayoutDashboardIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
      </div>

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
                  {currentDashboardData.assetStats.total}
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
                  {currentDashboardData.assetStats.active}
                </span>
                <Chip color="success" size="sm" variant="flat">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Chip>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-default-600">
                    Utilization
                  </span>
                  <span className="text-small font-medium">
                    {currentDashboardData.assetStats.total > 0
                      ? Math.round(
                          (currentDashboardData.assetStats.active /
                            currentDashboardData.assetStats.total) *
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
                    currentDashboardData.assetStats.total > 0
                      ? (currentDashboardData.assetStats.active /
                          currentDashboardData.assetStats.total) *
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
              <p className="text-small text-warning-600">Total Breakdowns</p>
            </div>
          </CardHeader>
          <Divider className="bg-warning-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-warning-700">
                  {currentDashboardData.workOrderStats.total}
                </span>
                <Chip color="warning" size="sm" variant="flat">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending: {currentDashboardData.workOrderStats.pending}
                </Chip>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-default-600">
                    In Progress
                  </span>
                  <span className="text-small font-medium">
                    {currentDashboardData.workOrderStats.inProgress}
                  </span>
                </div>
                <Progress
                  className="max-w-full"
                  color="warning"
                  size="sm"
                  value={
                    currentDashboardData.workOrderStats.total > 0
                      ? (currentDashboardData.workOrderStats.inProgress /
                          currentDashboardData.workOrderStats.total) *
                        100
                      : 0
                  }
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Critical Issues */}
        <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-danger-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-danger-800">
                Critical Issues
              </p>
              <p className="text-small text-danger-600">Requires Attention</p>
            </div>
          </CardHeader>
          <Divider className="bg-danger-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-danger-700">
                  {currentDashboardData.assetStats.critical +
                    currentDashboardData.workOrderStats.overdue}
                </span>
                <Chip color="danger" size="sm" variant="flat">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Critical
                </Chip>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-default-600">
                    Assets + Overdue
                  </span>
                  <span className="text-small font-medium">
                    {currentDashboardData.assetStats.critical} +{" "}
                    {currentDashboardData.workOrderStats.overdue}
                  </span>
                </div>
                <Progress
                  className="max-w-full"
                  color="danger"
                  size="sm"
                  value={
                    currentDashboardData.assetStats.total > 0
                      ? ((currentDashboardData.assetStats.critical +
                          currentDashboardData.workOrderStats.overdue) /
                          currentDashboardData.assetStats.total) *
                        100
                      : 0
                  }
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts and Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2">
          <DashboardCharts dashboardData={currentDashboardData} />
        </div>

        {/* Recent Activities */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Recent Activities</h3>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="space-y-4 p-4">
                {currentRecentActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-default-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <User
                        name={activity.user}
                        description={getActivityLabel(activity.type)}
                        avatarProps={{
                          src: activity.avatar,
                          size: "sm",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-default-700 line-clamp-2">
                        {activity.action}
                      </p>
                      <p className="text-xs text-default-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button
                color="primary"
                variant="flat"
                className="w-full justify-start"
                startContent={<Package className="w-4 h-4" />}
              >
                Add New Asset
              </Button>
              <Button
                color="warning"
                variant="flat"
                className="w-full justify-start"
                startContent={<Wrench className="w-4 h-4" />}
              >
                Create Work Order
              </Button>
              <Button
                color="secondary"
                variant="flat"
                className="w-full justify-start"
                startContent={<Activity className="w-4 h-4" />}
              >
                Schedule Maintenance
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
