import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { BackgroundDecor } from './BackgroundDecor';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <BackgroundDecor />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
