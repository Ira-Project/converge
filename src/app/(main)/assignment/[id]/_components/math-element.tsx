"use client";

import React from "react";
import { addStyles, StaticMathField } from "react-mathquill";
import { type RenderElementProps } from "slate-react/dist/components/editable";

addStyles();

export default function MathElement({ elementProps, latex }: 
  { elementProps: RenderElementProps, latex: string }) {

  return (
    <div className="py-2 bg-slate-100" {...elementProps.attributes}>
      <StaticMathField
        contentEditable={false}
      >
        {latex}
      </StaticMathField>
      {elementProps.children}
    </div>
  );
}
