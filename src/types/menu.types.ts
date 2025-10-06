/**
 * Menu item types for sidebar navigation
 */

// Sub-menu item (nested level)
export interface MenuSubItem {
    label: string;
    link: string;
}

// Main menu item
export interface MenuItem {
    label: string;
    icon: string;
    link?: string;
    subItems?: MenuSubItem[];
}

// Menu group (section with title)
export interface MenuGroup {
    title: string;
    items: MenuItem[];
}

// Complete menu configuration type
export type MenuConfig = MenuGroup[];
