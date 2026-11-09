import { useState } from 'react';
import Sidebar from '../Components/layout/Sidebar';
import Topbar from '../Components/layout/Topbar';
import { useDemo } from '../stores/DemoContext';

export default function DashboardLayout({ children, judul, peran: peranOpsi }) {
    const { peran } = useDemo();
    const peranAktif = peranOpsi ?? peran;
    const [sidebarBuka, setSidebarBuka] = useState(false);

    return (
        <div className="min-h-screen bg-powder-50">
            <Sidebar peran={peranAktif} buka={sidebarBuka} tutup={() => setSidebarBuka(false)} />

            <div className="lg:pl-[17rem]">
                <Topbar peran={peranAktif} judul={judul} bukaSidebar={() => setSidebarBuka(true)} />
                <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
            </div>
        </div>
    );
}
