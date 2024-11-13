import React from 'react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import {
  ChartBarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function Analytics() {
  const { data } = useAnalyticsStore();

  const stats = [
    {
      name: 'Total Users',
      value: data.users.total,
      change: `+${data.users.newThisMonth} this month`,
      icon: UserGroupIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Businesses',
      value: data.businesses.active,
      change: `${data.businesses.averageRating} avg rating`,
      icon: BuildingStorefrontIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Active Discounts',
      value: data.discounts.active,
      change: `${data.discounts.redemptions} redemptions`,
      icon: TagIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Upcoming Events',
      value: data.events.upcoming,
      change: `${data.events.totalAttendees} total attendees`,
      icon: CalendarIcon,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            View system analytics and statistics
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={`absolute rounded-md ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* User Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Users</span>
              <span className="text-sm font-medium text-gray-900">{data.users.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Active Users</span>
              <span className="text-sm font-medium text-gray-900">{data.users.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">New Users This Month</span>
              <span className="text-sm font-medium text-gray-900">{data.users.newThisMonth}</span>
            </div>
          </div>
        </div>

        {/* Business Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Business Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Businesses</span>
              <span className="text-sm font-medium text-gray-900">{data.businesses.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Active Businesses</span>
              <span className="text-sm font-medium text-gray-900">{data.businesses.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Average Rating</span>
              <span className="text-sm font-medium text-gray-900">{data.businesses.averageRating}</span>
            </div>
          </div>
        </div>

        {/* Discount Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Discount Statistics</h3>
          <dl className="mt-5 grid grid-cols-1 gap-5">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Active Discounts</dt>
              <dd className="text-sm font-medium text-gray-900">{data.discounts.active}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Expired Discounts</dt>
              <dd className="text-sm font-medium text-gray-900">{data.discounts.expired}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Total Redemptions</dt>
              <dd className="text-sm font-medium text-gray-900">{data.discounts.redemptions}</dd>
            </div>
          </dl>
        </div>

        {/* Event Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Event Statistics</h3>
          <dl className="mt-5 grid grid-cols-1 gap-5">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Upcoming Events</dt>
              <dd className="text-sm font-medium text-gray-900">{data.events.upcoming}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Past Events</dt>
              <dd className="text-sm font-medium text-gray-900">{data.events.past}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Total Attendees</dt>
              <dd className="text-sm font-medium text-gray-900">{data.events.totalAttendees}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}