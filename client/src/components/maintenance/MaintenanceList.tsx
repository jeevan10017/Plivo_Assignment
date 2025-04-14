import React from "react";
import format from "date-fns/format";
import { Maintenance, MaintenanceStatus } from "../../types/maintenance.ts";
import { Link } from "react-router-dom";

interface MaintenanceListProps {
  maintenances: Maintenance[];
  isLoading?: boolean;
  onEdit?: (maintenance: Maintenance) => void;
  onDelete?: (maintenanceId: string) => void;
}

export const MaintenanceList: React.FC<MaintenanceListProps> = ({
  maintenances,
  isLoading = false,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status?: MaintenanceStatus) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <div className="bg-white p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (maintenances.length === 0) {
    return (
      <div className="text-center py-10 bg-white shadow rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No scheduled maintenance
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by scheduling maintenance.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Title
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Scheduled Start
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Scheduled End
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {maintenances.map((maintenance) => (
            <tr key={maintenance.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                <Link
                  to={`/maintenance/${maintenance.id}`}
                  className="hover:text-indigo-600"
                >
                  {maintenance.title}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    maintenance.status
                  )}`}
                >
                  {maintenance.status
                    ? maintenance.status.replace("_", " ")
                    : "Unknown"}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {maintenance.scheduledStart &&
                !isNaN(new Date(maintenance.scheduledStart).getTime())
                  ? format(
                      new Date(maintenance.scheduledStart),
                      "MMM d, yyyy HH:mm"
                    )
                  : "N/A"}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {maintenance.scheduledEnd &&
                !isNaN(new Date(maintenance.scheduledEnd).getTime())
                  ? format(
                      new Date(maintenance.scheduledEnd),
                      "MMM d, yyyy HH:mm"
                    )
                  : "N/A"}
              </td>

              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end space-x-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(maintenance)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(maintenance.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
