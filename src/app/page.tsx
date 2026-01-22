export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <main className="flex flex-col items-center gap-8 p-8 max-w-2xl text-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">SMP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Green Rides Africa
          </h1>
        </div>

        <p className="text-lg text-gray-600">
          Partner Dashboard for Strategic Driver Acquisition
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-green-600">1,000</p>
            <p className="text-sm text-gray-500">Target Drivers</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-green-600">5</p>
            <p className="text-sm text-gray-500">Pipeline Stages</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <a
            href="/login"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            View Dashboard
          </a>
        </div>

        <p className="text-sm text-gray-400 mt-8">
          Powered by Sales Management Partners
        </p>
      </main>
    </div>
  );
}
