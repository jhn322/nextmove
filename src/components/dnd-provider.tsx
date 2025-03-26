"use client";

import { DndProvider as ReactDndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ReactNode } from "react";

export function DndProvider({ children }: { children: ReactNode }) {
  return <ReactDndProvider backend={HTML5Backend}>{children}</ReactDndProvider>;
}
