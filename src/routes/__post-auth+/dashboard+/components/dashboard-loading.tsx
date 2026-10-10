export function DashboardLoading() {
  return (
    <div className="grid min-h-[65vh] place-items-center">
      <div className="text-center">
        <img
          src="/worthtobuy-mark.png"
          className="mx-auto h-20 w-20 animate-floaty object-contain"
          alt="WORTHTOBUY"
        />
        <div className="mx-auto mt-4 h-2 w-32 overflow-hidden rounded-full bg-brand-100">
          <div
            className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cherry-500 to-rose-600"
          />
        </div>
        <p className="mt-3 text-sm font-bold text-brand-500">
          Loading business overview...
        </p>
      </div>
    </div>
  );
}
