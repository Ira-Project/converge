"use client";

import { LATEX_DELIMITER } from "@/lib/constants";
import { addStyles, StaticMathField } from "react-mathquill";

addStyles();

export default function FormattedText({ text }: { text: string}) { 

  const textList = text.split(LATEX_DELIMITER);

  return (
    <>
      {textList.map((text, index) => {
        if (index % 2 === 1) {
          return (
            <StaticMathField 
              key={index}
              contentEditable={false}>
              {text}
            </StaticMathField>
          )
        }
        return <span key={index}>{text}</span>
      })}
    </>
  )
}

