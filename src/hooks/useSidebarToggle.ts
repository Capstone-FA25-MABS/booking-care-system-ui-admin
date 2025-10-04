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
                } else {
                    body.classList.remove('expand-menu');
                }
            }
        };

        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    /**
     * Expand sidebar when clicking on menu items in mini mode
     * - Single menu items: expand immediately on click
     * - Menu items with sub-items: expand only when clicking on sub-item (not parent)
     */
    useEffect(() => {
        const handleMenuItemClick = (e: Event) => {
            const body = document.body;
            const toggleBtn = document.getElementById('toggle_btn');
            const target = e.target as HTMLElement;

            // Only proceed if in mini mode
            if (!body.classList.contains('mini-sidebar')) {
                return;
            }

            // First, find the closest link or button
            const clickedElement = target.closest('a, button');
            if (!clickedElement) {
                return;
            }

            // Find the parent <li> element
            const parentLi = clickedElement.closest('li');
            if (!parentLi) {
                return;
            }

            // Check if parent li has submenu class
            const hasSubmenu = parentLi.classList.contains('submenu');

            if (hasSubmenu) {
                // This is a parent with submenu
                // Check if the clicked element is a sub-item (inside nested ul)
                const isSubItem = clickedElement.closest('.submenu ul');

                if (isSubItem) {
                    // Clicked on a sub-item → expand sidebar
                    body.classList.remove('mini-sidebar', 'expand-menu');
                    toggleBtn?.classList.add('active');
                    localStorage.setItem('sidebarMode', 'expanded');
                }
                // If clicked on parent link/button (not sub-item) → do nothing
            } else {
                // This is a single menu item (no submenu) → expand sidebar
                body.classList.remove('mini-sidebar', 'expand-menu');
                toggleBtn?.classList.add('active');
                localStorage.setItem('sidebarMode', 'expanded');
            }
        };

        // Listen to clicks on sidebar menu
        const sidebar = document.querySelector('.sidebar');
        sidebar?.addEventListener('click', handleMenuItemClick);

        return () => {
            sidebar?.removeEventListener('click', handleMenuItemClick);
        };
    }, []);

    return { toggleMiniSidebar };
};
