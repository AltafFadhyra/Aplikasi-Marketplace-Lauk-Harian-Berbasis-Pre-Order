import Footer from '../Components/layout/Footer';
import Header from '../Components/layout/Header';
import MobileTabBar from '../Components/layout/MobileTabBar';

export default function AppLayout({ children, tanpaFooter = false, tanpaTabBar = false }) {
    return (
        <div className="flex min-h-screen flex-col bg-powder-50">
            <Header />

            <main className="flex-1">{children}</main>

            {tanpaFooter ? null : <Footer />}
            {tanpaTabBar ? null : <MobileTabBar />}
        </div>
    );
}
