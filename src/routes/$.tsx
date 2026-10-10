import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundRoute() {
  return (
    <div className="grid min-h-[70vh] place-items-center text-center p-6">
      <div className="card p-10 max-w-md w-full shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cherry-500/10 blur-xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-xl" />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-cherry-50 text-cherry-600 mb-4 shadow-sm">
          <Compass size={32} />
        </div>
        <p className="text-6xl font-black text-brand-900 tracking-tight">404</p>
        <h1 className="mt-2 text-xl font-black text-brand-900">Page Not Found</h1>
        <p className="mt-2 text-sm text-brand-500 leading-relaxed">
          The link you followed may be broken or the page may have been moved.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex items-center justify-center">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
