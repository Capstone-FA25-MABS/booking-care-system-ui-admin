import { useEffect, useCallback } from 'react';

/**
 * Custom hook to handle sidebar toggle functionality
 * Mimics the behavior of the original jQuery script
 */
export const useSidebarToggle = () => {
    /**
     * Toggle mini sidebar mode
     */
    const toggleMiniSidebar = useCallback(() => {
        const body = document.body;
        const toggleBtn = document.getElementById('toggle_btn');
        const isMini = body.classList.contains('mini-sidebar');

        if (isMini) {
            // Expand sidebar
            body.classList.remove('mini-sidebar');
            toggleBtn?.classList.add('active');
            localStorage.setItem('sidebarMode', 'expanded');
        } else {
            // Collapse to mini sidebar
            body.classList.add('mini-sidebar');
            toggleBtn?.classList.remove('active');
            localStorage.setItem('sidebarMode', 'mini');
        }
    }, []);

    /**
     * Initialize sidebar mode from localStorage on mount
     */
    useEffect(() => {
        const savedMode = localStorage.getItem('sidebarMode');
        const body = document.body;
        const toggleBtn = document.getElementById('toggle_btn');

        // Default is expanded (no mini-sidebar class)
        if (savedMode === 'mini') {
            body.classList.add('mini-sidebar');
            toggleBtn?.classList.remove('active');
        } else {
            // Remove mini-sidebar class to ensure expanded state
            body.classList.remove('mini-sidebar');
            toggleBtn?.classList.add('active');
        }
    }, []);

    /**
     * Setup hover expand/collapse for mini sidebar
     */
    useEffect(() => {
        const handleMouseOver = (e: MouseEvent) => {
            const body = document.body;
            const toggleBtn = document.getElementById('toggle_btn');

            if (
                body.classList.contains('mini-sidebar') &&
                toggleBtn &&
                toggleBtn.offsetParent !== null
            ) {
                const target = e.target as HTMLElement;
                const isNearSidebar = target.closest('.sidebar, .header-left');

                if (isNearSidebar) {
                    body.classList.add('expand-menu');
                    // Expand submenus
                    const submenus = document.querySelectorAll('.subdrop + ul');
                    submenus.forEach((submenu) => {
                        if (submenu instanceof HTMLElement) {
                            submenu.style.display = 'block';
                        }
                    });
                } else {
                    body.classList.remove('expand-menu');
                    // Collapse submenus
                    const submenus = document.querySelectorAll('.subdrop + ul');
                    submenus.forEach((submenu) => {
                        if (submenu instanceof HTMLElement) {
                            submenu.style.display = 'none';
                        }
                    });
                }
            }
        };

        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return { toggleMiniSidebar };
};
