import { ReactNode, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import type { MenuConfig } from '@/types/menu.types';

import MainHeader from '../components/MainHeader';
import Sidenav from '../components/Sidenav';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import styles from './MainLayout.module.scss';
import { AppFooter } from '@/components/AppFooter';

interface MainLayoutProps {
    listGroupMenuItem: MenuConfig;
    children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, listGroupMenuItem }) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const sidebarOverlayRef = useRef<HTMLDivElement>(null);
    const mainWrapperRef = useRef<HTMLDivElement>(null);

    // Initialize sidebar toggle functionality
    useSidebarToggle();

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
        <div className={clsx(styles.mainLayoutContainer)} ref={sidebarRef}>
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
                <div className="page-wrapper">
                    <main className={styles.contentContainer}>{children ?? <Outlet />}</main>
                    <AppFooter />
                </div>
            </div>
            <div className="sidebar-overlay" ref={sidebarOverlayRef}></div>
        </div>
    );
};

export default MainLayout;
