import { useState, useCallback } from "react";

export const useHighlightedSquares = () => {
  const [highlightedSquares, setHighlightedSquares] = useState<Set<string>>(
    new Set()
  );

  const handleRightClick = useCallback(
    (square: string, event: React.MouseEvent) => {
      event.preventDefault(); // Prevent the context menu from appearing

      setHighlightedSquares((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(square)) {
          newSet.delete(square);
        } else {
          newSet.add(square);
        }
        return newSet;
      });

      return false; // Prevent default browser context menu
    },
    []
  );

  const handleLeftClick = useCallback(() => {
    setHighlightedSquares(new Set());
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightedSquares(new Set());
  }, []);

  const isHighlighted = useCallback(
    (square: string) => {
      return highlightedSquares.has(square);
    },
    [highlightedSquares]
  );

  return {
    highlightedSquares,
    handleRightClick,
    handleLeftClick,
    clearHighlights,
    isHighlighted,
  };
};

export default useHighlightedSquares;
