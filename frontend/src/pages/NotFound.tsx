import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-28 text-center">
      <p className="font-display text-7xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-bold">Page not found</h1>
      <p className="text-sm text-stone-500">The page you’re looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn-primary mt-2">Back home</Link>
    </div>
  );
}
