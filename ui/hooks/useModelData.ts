import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useTabStore } from '@/store/useTabStore';
import { ModelResponse, MongooseDoc, SortState, FieldInfo } from '@/types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useModelData(modelName: string) {
    const { activeTabId, updateTab, tabs } = useTabStore();
    const activeTab = tabs.find(t => t.id === activeTabId);

    // Initial state from tab history or defaults
    const [page, setPage] = useState(activeTab?.page || 1);
    const [limit] = useState(50);
    const [filterStr, setFilterStr] = useState(activeTab?.query || "");
    const [debouncedFilter, setDebouncedFilter] = useState(activeTab?.query || "");

    // Default sort by _id descending (newest first)
    const [sort, setSort] = useState<SortState>({ field: '_id', order: -1 });

    const [sheetDoc, setSheetDoc] = useState<MongooseDoc | null>(null);

    // Debounce filter input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilter(filterStr);
        }, 500);
        return () => clearTimeout(handler);
    }, [filterStr]);

    // Construct URL with all params
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        query: debouncedFilter,
        sort: `${sort.field}:${sort.order}`
    });

    const key = `/api/models/${modelName}/data?${queryParams.toString()}`;

    const { data, error, isLoading, mutate: refreshData } = useSWR<ModelResponse>(key, fetcher);

    // Sync state to Tab Store (for persistence)
    useEffect(() => {
        if (activeTabId && activeTab?.type === 'model' && activeTab.name === modelName) {
            updateTab(activeTabId, {
                page,
                query: debouncedFilter
            });
        }
    }, [page, debouncedFilter, activeTabId, modelName, updateTab, activeTab?.name, activeTab?.type]);

    // Sync URL/Tab query to local state only when tab changes.
    // Sync URL/Tab query to local state only when tab id changes (switching tabs).
    // We use the "derived state" pattern to update state during render if ID changes.
    const [prevTabId, setPrevId] = useState(activeTabId);
    if (activeTabId !== prevTabId) {
        setPrevId(activeTabId);
        const newPage = activeTab?.page || 1;
        const newQuery = activeTab?.query || "";
        setPage(newPage);
        setFilterStr(newQuery);
        setDebouncedFilter(newQuery);
    }

    // Actions
    const applyFilter = (q?: string) => {
        if (q !== undefined) {
            setFilterStr(q);
            setPage(1); // Reset page on filter change
        }
    };

    const handleFilterChange = (val: string) => {
        setFilterStr(val);
    };

    // Derived safely
    const docs = data?.docs || [];
    // Robust fields fallback: Use metadata fields if available
    // If metadata is missing, we infer fields from ALL documents (not just the first one) to avoid missing optional fields ("Disappearing Columns" bug)
    // We also attempt to detect ObjectIDs and Dates to provide better UI experience even without metadata.
    const rawFields = data?.fields || [];

    let fields = rawFields;

    if (!fields || fields.length === 0) {
        if (docs.length > 0) {
            const allKeys = new Set<string>();
            docs.forEach(d => Object.keys(d).forEach(k => k !== '__v' && allKeys.add(k)));

            fields = Array.from(allKeys).map(key => {
                // Heuristic Type Inference
                let type = 'String';
                let ref: string | undefined = undefined;

                // Check samples for this key
                for (const doc of docs) {
                    const val = doc[key];
                    if (val === undefined || val === null) continue;

                    if (typeof val === 'boolean') {
                        type = 'Boolean';
                        break;
                    }
                    if (typeof val === 'number') {
                        type = 'Number';
                        break;
                    }
                    if (typeof val === 'string') {
                        // Regex check for ObjectID
                        if (val.match(/^[0-9a-fA-F]{24}$/)) {
                            type = 'ObjectID';
                            // Try to guess ref
                            if (key === 'owner' || key === 'user' || key === 'author') ref = 'User';
                            else if (key.endsWith('Id')) {
                                // e.g. postId -> Post, categoryId -> Category
                                // capitalization logic: postId -> Post
                                const base = key.replace(/Id$/, '');
                                ref = base.charAt(0).toUpperCase() + base.slice(1);
                            }
                            break;
                        }
                        // Check for Date
                        if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) && !isNaN(Date.parse(val))) {
                            type = 'Date';
                            break;
                        }
                    }
                }

                return {
                    path: key,
                    type,
                    instance: type,
                    required: false,
                    ref
                };
            }) as FieldInfo[];
        } else {
            fields = [];
        }
    }

    const meta = data?.meta || { total: 0, pages: 0, page: 1, limit: 50 };

    return {
        docs,
        meta,
        fields,
        isLoading,
        error,

        // State
        page,
        setPage,
        limit,
        filterStr,
        debouncedFilter,

        // Actions
        handleFilterChange,
        applyFilter,
        refreshData,

        // Sorting
        sort,
        setSort: (field: string) => {
            setSort(prev => ({
                field,
                order: prev.field === field ? (prev.order === 1 ? -1 : 1) : -1
            }));
        },

        // Context
        activeTab,

        // Sheet/Preview
        sheetDoc,
        setSheetDoc
    };
}
