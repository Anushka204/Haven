import Link from "next/link";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function EntryLayout({ children }) {
  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          ← Back to Dashboard
        </Link>
      </div>
      <Suspense fallback={<BarLoader color="orange" width={"100%"}></BarLoader>}>{children}</Suspense>
    </div>
  );
}