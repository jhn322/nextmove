import React, { memo, useCallback, useRef, useState, useEffect } from "react";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import HoverText from "@/components/ui/hover-text";
import { Check } from "lucide-react";

interface VirtualizedAvatarGridProps {
  availableAvatars: string[];
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
  getCharacterNameFromPath: (path: string) => string;
  columnCount?: number;
  rowHeight?: number;
  colWidth?: number;
  className?: string;
}

const AVATAR_SIZE = 64;
const AVATAR_GAP = 16;

const VirtualizedAvatarGrid: React.FC<VirtualizedAvatarGridProps> = memo(
  ({
    availableAvatars,
    selectedAvatar,
    onSelect,
    getCharacterNameFromPath,
    columnCount: initialColumnCount = 4,
    rowHeight = AVATAR_SIZE + AVATAR_GAP + 24,
    colWidth = AVATAR_SIZE + AVATAR_GAP,
    className,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [columnCount, setColumnCount] = useState<number>(initialColumnCount);

    // Dynamically calculate columns based on container width
    useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setContainerWidth(width);
          const cols = Math.max(1, Math.floor(width / colWidth));
          setColumnCount(cols);
        }
      };
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }, [colWidth]);

    const rowCount = Math.ceil(availableAvatars.length / columnCount);

    const Cell = useCallback(
      ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= availableAvatars.length) return null;
        const avatar = availableAvatars[index];
        const isSelected = avatar === selectedAvatar;
        const name = getCharacterNameFromPath(avatar);
        return (
          <div
            style={style}
            className="flex flex-col items-center justify-center ml-6"
          >
            <HoverText text={name} side="bottom">
              <Button
                variant="ghost"
                className="p-1 h-auto relative"
                tabIndex={0}
                aria-label={`Select avatar: ${name}`}
                onClick={() => onSelect(avatar)}
              >
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-transparent hover:border-primary transition-all bg-card">
                    <Image
                      src={avatar}
                      alt={name}
                      width={AVATAR_SIZE}
                      height={AVATAR_SIZE}
                      className="rounded-full object-cover bg-card"
                      loading="lazy"
                    />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </Button>
            </HoverText>
            <span
              className="mt-1 text-xs text-center w-full truncate"
              title={name}
            >
              {name}
            </span>
          </div>
        );
      },
      [
        availableAvatars,
        selectedAvatar,
        onSelect,
        getCharacterNameFromPath,
        columnCount,
      ]
    );

    return (
      <div ref={containerRef} className={`w-full h-[300px] ${className || ""}`}>
        {containerWidth > 0 && (
          <div className="flex justify-center w-full h-full">
            <Grid
              columnCount={columnCount}
              rowCount={rowCount}
              columnWidth={colWidth}
              rowHeight={rowHeight}
              height={300}
              width={containerWidth}
            >
              {Cell}
            </Grid>
          </div>
        )}
      </div>
    );
  }
);
VirtualizedAvatarGrid.displayName = "VirtualizedAvatarGrid";

export default VirtualizedAvatarGrid;
