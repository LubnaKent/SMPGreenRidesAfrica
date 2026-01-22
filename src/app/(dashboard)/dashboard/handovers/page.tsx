import { Plus, Calendar } from "lucide-react";

export default function HandoversPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Handovers</h1>
          <p className="text-sm text-gray-500">
            Schedule and manage driver handovers to Greenwheels
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Schedule Handover
        </button>
      </div>

      {/* Handover list */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">No handovers scheduled</p>
          <p className="text-sm text-gray-400">
            Schedule a handover once you have qualified drivers ready
          </p>
        </div>
      </div>
    </div>
  );
}
