"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line, Pie } from "react-chartjs-2";
import { Card, CardHeader, CardBody, Divider } from "@heroui/react";
import { BarChart3, TrendingUp, Activity, AlertTriangle } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
);

interface DashboardChartsProps {
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
}

export default function DashboardCharts({
  dashboardData,
}: DashboardChartsProps) {
  const {
    assetStats,
    workOrderStats,
    monthlyBreakdowns,
    categoryDistribution,
    maintenancePerformance,
  } = dashboardData;

  // Asset Utilization Chart (Doughnut)
  const assetUtilizationData = {
    labels: ["Operational", "Maintenance", "Critical", "Offline"],
    datasets: [
      {
        data: [
          assetStats.active,
          assetStats.maintenance,
          assetStats.critical,
          assetStats.total -
            assetStats.active -
            assetStats.maintenance -
            assetStats.critical,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Green
          "rgba(251, 191, 36, 0.8)", // Yellow
          "rgba(239, 68, 68, 0.8)", // Red
          "rgba(156, 163, 175, 0.8)", // Gray
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Work Order Status Chart (Bar)
  const workOrderStatusData = {
    labels: ["Pending", "In Progress", "RFU", "Overdue"],
    datasets: [
      {
        label: "Work Orders",
        data: [
          workOrderStats.pending,
          workOrderStats.inProgress,
          workOrderStats.rfu,
          workOrderStats.overdue,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(251, 191, 36, 0.8)", // Yellow
          "rgba(34, 197, 94, 0.8)", // Green
          "rgba(239, 68, 68, 0.8)", // Red
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Monthly Breakdown Trend (Line)
  const monthlyBreakdownData = {
    labels: monthlyBreakdowns.map((item) => item.month),
    datasets: [
      {
        label: "Breakdowns",
        data: monthlyBreakdowns.map((item) => item.count),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Asset Category Distribution (Pie)
  const categoryDistributionData = {
    labels: categoryDistribution.map((item) => item.category),
    datasets: [
      {
        data: categoryDistribution.map((item) => item.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Maintenance Performance (Horizontal Bar)
  const maintenancePerformanceData = {
    labels: maintenancePerformance.map((item) => item.department),
    datasets: [
      {
        label: "Completion Rate (%)",
        data: maintenancePerformance.map((item) => item.completionRate),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Asset Utilization Chart */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-primary-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-primary-800">
              Asset Utilization
            </p>
            <p className="text-small text-primary-600">Status distribution</p>
          </div>
        </CardHeader>
        <Divider className="bg-primary-200" />
        <CardBody className="px-6 py-4">
          <div className="h-64">
            <Doughnut data={assetUtilizationData} options={chartOptions} />
          </div>
        </CardBody>
      </Card>

      {/* Work Order Status Chart */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-success-500 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-success-800">
              Work Order Status
            </p>
            <p className="text-small text-success-600">Current breakdowns</p>
          </div>
        </CardHeader>
        <Divider className="bg-success-200" />
        <CardBody className="px-6 py-4">
          <div className="h-64">
            <Bar data={workOrderStatusData} options={barChartOptions} />
          </div>
        </CardBody>
      </Card>

      {/* Monthly Breakdown Trend */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-warning-500 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-warning-800">
              Monthly Breakdown Trend
            </p>
            <p className="text-small text-warning-600">Last 6 months</p>
          </div>
        </CardHeader>
        <Divider className="bg-warning-200" />
        <CardBody className="px-6 py-4">
          <div className="h-64">
            <Line data={monthlyBreakdownData} options={chartOptions} />
          </div>
        </CardBody>
      </Card>

      {/* Asset Category Distribution */}
      <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-secondary-500 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-secondary-800">
              Asset Categories
            </p>
            <p className="text-small text-secondary-600">
              Distribution by type
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-secondary-200" />
        <CardBody className="px-6 py-4">
          <div className="h-64">
            <Pie data={categoryDistributionData} options={chartOptions} />
          </div>
        </CardBody>
      </Card>

      {/* Maintenance Performance */}
      <Card className="bg-gradient-to-br from-danger-50 to-danger-100 lg:col-span-2">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-danger-500 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-danger-800">
              Maintenance Performance
            </p>
            <p className="text-small text-danger-600">
              Completion rate by department
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-danger-200" />
        <CardBody className="px-6 py-4">
          <div className="h-48">
            <Bar
              data={maintenancePerformanceData}
              options={horizontalBarOptions}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
