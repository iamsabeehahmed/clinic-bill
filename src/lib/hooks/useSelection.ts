'use client';

import { useState, useCallback, useMemo } from 'react';

interface UseSelectionReturn {
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectAll: (allIds: string[]) => void;
  selectNone: () => void;
  isAllSelected: (allIds: string[]) => boolean;
  isIndeterminate: (allIds: string[]) => boolean;
  selectedCount: number;
}

export function useSelection(initialIds: string[] = []): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((allIds: string[]) => {
    setSelectedIds(allIds);
  }, []);

  const selectNone = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isAllSelected = useCallback(
    (allIds: string[]) => {
      if (allIds.length === 0) return false;
      return allIds.every((id) => selectedIds.includes(id));
    },
    [selectedIds]
  );

  const isIndeterminate = useCallback(
    (allIds: string[]) => {
      const selectedCount = allIds.filter((id) => selectedIds.includes(id)).length;
      return selectedCount > 0 && selectedCount < allIds.length;
    },
    [selectedIds]
  );

  const selectedCount = useMemo(() => selectedIds.length, [selectedIds]);

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    selectNone,
    isAllSelected,
    isIndeterminate,
    selectedCount,
  };
}
