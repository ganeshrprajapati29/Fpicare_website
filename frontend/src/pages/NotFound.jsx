import { Link } from 'react-router-dom';
import { useTitle } from '../components/ui';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-8xl font-extrabold text-gradient">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn-primary mt-8">Go home</Link>
    </div>
  );
}
