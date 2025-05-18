import React from "react";
import { boardThemes } from "@/components/game/board/Square";
import Image from "next/image";

interface PresetPreviewProps {
  boardTheme: string;
  pieceSet: string;
}

const PresetPreview: React.FC<PresetPreviewProps> = ({
  boardTheme,
  pieceSet,
}) => {
  const colors = boardThemes[boardTheme] || boardThemes["emerald"];
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-12 h-12 rounded border ${colors.light} flex items-center justify-center`}
      >
        <Image
          src={`/pieces/${pieceSet}/wk.svg`}
          alt="King"
          width={36}
          height={36}
        />
      </div>
      <div
        className={`w-12 h-12 rounded border ${colors.dark} flex items-center justify-center`}
      >
        <Image
          src={`/pieces/${pieceSet}/wq.svg`}
          alt="Queen"
          width={36}
          height={36}
        />
      </div>
      <div
        className={`w-12 h-12 rounded border ${colors.light} flex items-center justify-center`}
      >
        <Image
          src={`/pieces/${pieceSet}/wr.svg`}
          alt="Rook"
          width={36}
          height={36}
        />
      </div>
      <div
        className={`w-12 h-12 rounded border ${colors.dark} flex items-center justify-center`}
      >
        <Image
          src={`/pieces/${pieceSet}/wb.svg`}
          alt="Bishop"
          width={36}
          height={36}
        />
      </div>
    </div>
  );
};

export default PresetPreview;
