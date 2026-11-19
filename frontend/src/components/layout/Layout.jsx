import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import WhatsAppButton from './WhatsAppButton';
import AgeGate from './AgeGate';
import BackToTop from './BackToTop';
import useReveal from '../../utils/useReveal';

export default function Layout() {
  const { pathname } = useLocation();
  useReveal(pathname);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main key={pathname} className="page-enter flex-1 overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <BackToTop />
      <WhatsAppButton />
      <AgeGate />
    </div>
  );
}
