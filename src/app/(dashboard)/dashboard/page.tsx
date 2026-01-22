import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Drivers",
    value: "0",
    change: "+0 this month",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    name: "Qualified",
    value: "0",
    change: "0% conversion",
    icon: UserCheck,
    color: "bg-green-500",
  },
  {
    name: "In Pipeline",
    value: "0",
    change: "Across all stages",
    icon: Clock,
    color: "bg-yellow-500",
  },
  {
    name: "Handed Over",
    value: "0",
    change: "Target: 40 this month",
    icon: TrendingUp,
    color: "bg-purple-500",
  },
];

const recentDrivers = [
  // Placeholder data - will be replaced with real data
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your driver acquisition pipeline
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Summary */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Pipeline Summary
          </h2>
          <p className="text-sm text-gray-500">Drivers by stage</p>

          <div className="mt-4 space-y-3">
            {[
              { stage: "Sourced", count: 0, color: "bg-gray-400" },
              { stage: "Screening", count: 0, color: "bg-yellow-400" },
              { stage: "Qualified", count: 0, color: "bg-blue-400" },
              { stage: "Onboarding", count: 0, color: "bg-purple-400" },
              { stage: "Handed Over", count: 0, color: "bg-green-400" },
            ].map((item) => (
              <div key={item.stage} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm text-gray-600">
                  {item.stage}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <a
              href="/dashboard/pipeline"
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              View full pipeline →
            </a>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Target</h2>
          <p className="text-sm text-gray-500">January 2026 progress</p>

          <div className="mt-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">of 40 drivers</p>
              </div>
              <p className="text-lg font-medium text-gray-400">0%</p>
            </div>

            <div className="mt-4 h-3 w-full rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full bg-green-500 transition-all"
                style={{ width: "0%" }}
              />
            </div>

            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>0 handed over</span>
              <span>40 target</span>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/dashboard/analytics"
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              View analytics →
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Drivers</h2>
        <p className="text-sm text-gray-500">Latest additions to the pipeline</p>

        {recentDrivers.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No drivers yet</p>
            <a
              href="/dashboard/drivers/new"
              className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Add First Driver
            </a>
          </div>
        ) : (
          <div className="mt-4">
            {/* Driver list will go here */}
          </div>
        )}
      </div>
    </div>
  );
}
