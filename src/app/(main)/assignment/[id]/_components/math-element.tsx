"use client";

import React from "react";
import { addStyles, StaticMathField } from "react-mathquill";

addStyles();

export default function MathElement({ text }: { text: string | undefined }) {

  return (
    <StaticMathField>{text}</StaticMathField>
  );
}
