"use client";

import { LATEX_DELIMITER } from "@/lib/constants";
import katex from "katex";

export default function FormattedText({ text, padding }: { text: string, padding?: boolean}) { 

  const textList = text.split(LATEX_DELIMITER);

  return (
    <>
      {textList.map((text, index) => {
        if (index % 2 === 1) {
          return (
            <span
              className={padding ? "px-2" : ""}
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(text, {
                  throwOnError: false,
                })
              }}
            />
          )
        }
        return <span key={index}>{text}</span>
      })}
    </>
  )
}

