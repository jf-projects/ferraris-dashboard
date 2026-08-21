import CollectionsOverview from "@/components/dashboard/collection-overview";
import DashboardStats from "@/components/dashboard/dashboard-stat";
// import PaymentStatus from "@/components/dashboard/payment-status";
import QuickActions from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  return (
    <>
      <h2 className="text-4xl font-bold text-white space-y-6">
        Dashboard
      </h2>

      <p className="mt-2 text-slate-400">
        Welcome back.
      </p>

      <div className="space-y-6">
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CollectionsOverview />
          </div>
          <div>
            {/* <PaymentStatus /> */}
            <QuickActions/>
          </div>
        </div>
      </div>
    </>
  );
}