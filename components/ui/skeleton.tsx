"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Skeleton,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

export function SpinnerHero() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-small text-default-500">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-small text-default-500">Loading...</p>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div>
      <Card>
        {/* Header */}
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <Skeleton className="w-6 h-6 rounded" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <Skeleton className="h-5 w-40 rounded mb-1" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <Skeleton className="hidden sm:flex w-64 h-7 rounded" />
            <Skeleton className="w-20 h-7 rounded" />
            <Skeleton className="w-24 h-7 rounded" />
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-0">
          {/* Search input untuk mobile */}
          <div className="px-6 pb-4 sm:hidden">
            <Skeleton className="w-full h-9 rounded" />
          </div>
          <div className="overflow-x-auto">
            <Table aria-label="Work orders table" className="min-w-full">
              <TableHeader>
                <TableColumn className="rounded-tl-xl">ORDER</TableColumn>
                <TableColumn>REPORTED BY</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>STATUS UNIT</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>STATUS WO</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn className="rounded-tr-xl">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {[...Array(10)].map((_, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {/* ORDER */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20 rounded" />
                          <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </TableCell>
                    {/* REPORTED BY */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <div>
                          <Skeleton className="h-3 w-20 rounded" />
                          <Skeleton className="h-3 w-16 rounded mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    {/* PRIORITY */}
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    {/* STATUS UNIT */}
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    {/* LOCATION */}
                    <TableCell>
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-3 w-16 rounded mt-1" />
                    </TableCell>
                    {/* STATUS WO */}
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-3 w-16 rounded mt-1" />
                    </TableCell>
                    {/* DATE */}
                    <TableCell>
                      <Skeleton className="h-3 w-16 rounded" />
                      <Skeleton className="h-3 w-12 rounded mt-1" />
                    </TableCell>
                    {/* ACTIONS */}
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export function TableReportSkeletons (){
  return (
    
      <div className="grid grid-cols-1 gap-6 mb-8">
        {[...Array(1)].map((_, i) => (
          <Card key={i}className="h-full">
          <div className="flex p-4">
            <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
            <div className="pl-3 flex flex-col min-w-0 flex-1">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Divider/>
          <Card className="h-72 p-4">
              <Skeleton className="h-full rounded-lg">
                <div className="h-full w-full rounded-lg bg-secondary" />
              </Skeleton>
          </Card>
        </Card>
        ))}
      </div>
    
  )
}

export function DashboardSkeleton() {
  return (
    <div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex gap-2 sm:gap-3 pb-3 pt-4">
              <Skeleton className="p-1.5 sm:p-2 rounded-lg w-8 h-8 sm:w-10 sm:h-10" />
              <div className="flex flex-col min-w-0 flex-1">
                <Skeleton className="h-4 sm:h-5 w-22 sm:w-24 mb-1" />
                <Skeleton className="h-3 sm:h-4 w-18 sm:w-20" />
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 sm:h-7 w-10" />
                  <Skeleton className="h-6 sm:h-7 w-12 rounded-xl" />
                </div>
                <div className="space-y-1 sm:space-y-2 pt-1 sm:pt-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}className="h-full">
          <div className="flex p-4">
            <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
            <div className="pl-3 flex flex-col min-w-0 flex-1">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Divider/>
          <Card className="h-72 p-4">
              <Skeleton className="h-full rounded-lg">
                <div className="h-full w-full rounded-lg bg-secondary" />
              </Skeleton>
          </Card>
        </Card>
        ))}
      </div>

      {/* <CardHeader className="flex gap-2 sm:gap-3 pb-3 pt-4">
              <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
              <div className="flex flex-col min-w-0 flex-1">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader> */}
    </div>
  );
}

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {/* Total Orders Card */}
      <Card>
        <CardHeader className="flex gap-2 sm:gap-3 pb-3 pt-4">
          <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
          <div className="flex flex-col min-w-0 flex-1">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-7 w-12 rounded-xl" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-7 w-14 rounded-xl" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* In Progress Orders Card */}
      <Card>
        <CardHeader className="flex gap-2 sm:gap-3 pb-3 pt-4">
          <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
          <div className="flex flex-col min-w-0 flex-1">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-7 w-12 rounded-xl" />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Pending Orders Card */}
      <Card>
        <CardHeader className="flex gap-2 sm:gap-3 pb-3 pt-4">
          <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
          <div className="flex flex-col min-w-0 flex-1">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-7 w-12 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </CardBody>
      </Card>

      {/* Overdue Orders Card */}
      <Card>
        <CardHeader className="flex gap-2 sm:gap-3 pb-3 pt-4">
          <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
          <div className="flex flex-col min-w-0 flex-1">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-7 w-12 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export function AssetSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="p-2 rounded-xl w-10 h-10" />
          <div>
            <Skeleton className="h-8 w-48 rounded" />
          </div>
        </div>
      </div> */}

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex gap-2 sm:gap-3 pb-3 pt-4">
              <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
              <div className="flex flex-col min-w-0 flex-1">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-7 w-10" />
                  <Skeleton className="h-7 w-12 rounded-xl" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <Skeleton className="w-6 h-6 rounded" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <Skeleton className="h-5 w-40 rounded mb-1" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <Skeleton className="hidden sm:flex w-64 h-7 rounded" />
            <Skeleton className="w-20 h-7 rounded" />
            <Skeleton className="w-24 h-7 rounded" />
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-0">
          <div className="px-6 pb-4 sm:hidden">
            <Skeleton className="w-full h-9 rounded" />
          </div>
          <div className="overflow-x-auto">
            <Table aria-label="Assets table" className="min-w-full">
              <TableHeader>
                <TableColumn className="rounded-tl-xl">ASSET</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>ASSIGNED TO</TableColumn>
                <TableColumn>LAST MAINTENANCE</TableColumn>
                <TableColumn className="rounded-tr-xl">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {[...Array(8)].map((_, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20 rounded" />
                          <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-24 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3 w-24 rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="h-3 w-20 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-3 w-16 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export function SettingsSkeleton() {
  return (   
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
      {/* Profile Setting Skeleton */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex gap-2 sm:gap-3 pb-3 pt-4">
            <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
            <div className="flex flex-col min-w-0 flex-1">
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            <div>
              {/* Photo Section */}
              <div className="sm:flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
                <div className="py-3 sm:flex-1 sm:space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Skeleton className="h-12 w-full rounded-lg" />                  
                    <Skeleton className="h-12 w-full rounded-lg" />                    
                  </div>
                  <Skeleton className="mt-2 h-8 w-32 rounded-lg" />
                </div>
              </div>
              
              {/* Form Fields */}
              <div className="mt-4 space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div className="space-y-4">
                  <p className="h-3 w-40"></p>
                  {/* <Skeleton className="h-4 w-40" /> */}
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end">
                <Skeleton className="h-10 w-40 rounded-lg" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Setting Skeleton */}
      <div>
        <Card>
          <CardHeader className="flex gap-2 sm:gap-3 pb-4 pt-4">
            <Skeleton className="p-1.5 sm:p-2 rounded-lg w-10 h-10" />
            <div className="flex flex-col min-w-0 flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="px-2 sm:px-4 py-2 sm:py-4">
            <div className="space-y-4">
              {/* Notification Settings */}
              <div className="space-y-3 mt-1 mb-1">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-2 ">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-full rounded-lg" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-full rounded-lg" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-full rounded-lg" />
                  </div>
                  
                </div>
              </div>
              
              <Divider />
              
              {/* Theme Settings */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-full rounded-lg" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-full rounded-lg" />
                  </div>
                  <div className="pt-2 pb-16">
                  <Skeleton className="h-4 w-[50%]" /></div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
