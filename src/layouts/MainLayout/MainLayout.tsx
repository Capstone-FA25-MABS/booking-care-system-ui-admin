import { ReactNode, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';

import MainHeader from '../components/MainHeader';
import Sidenav from '../components/Sidenav';
import styles from './MainLayout.module.scss';

interface MainLayoutProps {
    listGroupMenuItem: Array<{
        title: string;
        items: Array<{
            label: string;
            link?: string;
            icon: string;
            subItems?: Array<{ label: string; link: string }>;
        }>;
    }>;
    children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, listGroupMenuItem }) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const sidebarOverlayRef = useRef<HTMLDivElement>(null);
    const mainWrapperRef = useRef<HTMLDivElement>(null);

    const toggleSidebarExpand = (expand: boolean) => {
        sidebarRef.current?.classList.toggle('expand-menu', expand);
    };

    const openSidebar = () => {
        mainWrapperRef.current?.classList.add('slide-nav');
        sidebarOverlayRef.current?.classList.add('opened');
    };

    const closeSidebar = () => {
        mainWrapperRef.current?.classList.remove('slide-nav');
        sidebarOverlayRef.current?.classList.remove('opened');
    };

    return (
        <div className={clsx(styles.mainLayoutContainer, 'mini-sidebar')} ref={sidebarRef}>
            <div className="main-wrapper" ref={mainWrapperRef}>
                <MainHeader handleClickMenuButton={openSidebar} />
                <div
                    onMouseEnter={() => toggleSidebarExpand(true)}
                    onMouseLeave={() => toggleSidebarExpand(false)}
                >
                    <Sidenav
                        handleClickCloseSidebar={closeSidebar}
                        listGroupMenuItem={listGroupMenuItem}
                    />
                </div>
                <main className={styles.contentContainer}>{children ?? <Outlet />}</main>
            </div>
            <div className="sidebar-overlay" ref={sidebarOverlayRef}></div>
        </div>
    );
};

export default MainLayout;
