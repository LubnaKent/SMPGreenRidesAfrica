export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your account and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500">Update your personal information</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Layla Ndaula"
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="ndaulalayla@gmail.com"
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  defaultValue="+256755086988"
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Save Changes
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Password</h2>
            <p className="text-sm text-gray-500">Update your password</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-900">SMP Admin</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Member since</span>
                <span className="font-medium text-gray-900">Jan 2026</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
            <p className="mt-1 text-sm text-red-600">
              Permanently delete your account and all data
            </p>
            <button className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
