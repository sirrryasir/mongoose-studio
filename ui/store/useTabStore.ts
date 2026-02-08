import { create } from 'zustand';

export type Tab = {
    id: string;
    type: 'model' | 'welcome';
    name: string;
    query?: string; // For deep linking filters
    previewId?: string | null; // For side panel deep linking
    page?: number;
};

interface TabState {
    tabs: Tab[];
    activeTabId: string | null;
    openTab: (tab: Tab) => void;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    updateTab: (id: string, updates: Partial<Tab>) => void;
}

export const useTabStore = create<TabState>((set) => ({
    tabs: [],
    activeTabId: null,

    openTab: (tab) =>
        set((state) => {
            const exists = state.tabs.find((t) => t.id === tab.id);
            if (exists) {
                // Update existing tab with new properties/filters
                return {
                    tabs: state.tabs.map(t => t.id === tab.id ? { ...t, ...tab } : t),
                    activeTabId: tab.id
                };
            }
            return {
                tabs: [...state.tabs, tab],
                activeTabId: tab.id,
            };
        }),

    updateTab: (id, updates) =>
        set((state) => ({
            tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

    closeTab: (id) =>
        set((state) => {
            const newTabs = state.tabs.filter((t) => t.id !== id);
            const isActive = state.activeTabId === id;

            let nextActiveId = state.activeTabId;
            if (isActive) {
                // If we closed the active tab, switch to the last one, or null
                nextActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
            }

            return {
                tabs: newTabs,
                activeTabId: nextActiveId,
            };
        }),

    setActiveTab: (id) => set({ activeTabId: id }),
}));
