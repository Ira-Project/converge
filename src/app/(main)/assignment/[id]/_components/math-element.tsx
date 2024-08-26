"use client";

import React from "react";
import { addStyles, StaticMathField } from "react-mathquill";

addStyles();

export default function MathElement({ text }: { text: string | undefined }) {

  return (
    <div className="py-2">
      <StaticMathField>{text}</StaticMathField>
    </div>
  );
}
