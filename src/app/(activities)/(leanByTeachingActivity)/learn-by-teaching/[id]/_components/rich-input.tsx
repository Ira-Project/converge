'use client';

import { useCallback, useState } from "react"
import { createEditor, Editor, Node, type Descendant } from 'slate'
import { Slate, Editable, withReact, type RenderElementProps } from 'slate-react'

import { type BaseEditor } from 'slate'
import { type ReactEditor } from 'slate-react'

export type CustomEditor = BaseEditor & ReactEditor

export type ParagraphElement = {
  latex: string;
  type: 'paragraph'
  children: CustomText[]
}

export type CustomElement = ParagraphElement;
export type FormattedText = { text: string; bold?: true }
export type CustomText = FormattedText

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
] as Descendant[]

export function RichInput(
  { updateValue } : 
  { updateValue: (value: string) => void }) {

  const [editor] = useState(() => withReact(createEditor()))
  const [charCount, setCharCount] = useState(0);

  const onChange = useCallback(() => {
    const value = editor.children.map(
      (node) => Node.string(node)).join('\n')
    updateValue(value)
    setCharCount(value.length)
  }, [])

  const renderElement = useCallback((props: RenderElementProps) => {
    switch(props.element.type) {
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  return (
    <>
      <div className="h-full overflow-scroll resize-none p-2 relative">
        <Slate
          editor={editor}
          onChange={onChange}
          initialValue={initialValue}>
          <Editable 
            onDOMBeforeInput={(event) => {
              const inputType = event.inputType;
              if (inputType === 'insertText' || inputType === 'insertParagraph') {
                const textLength = Editor.string(editor, []).length;
                if (textLength >= 1000) {
                  event.preventDefault();
                  return;
                }
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              const pastedText = event.clipboardData.getData('text');
              const currentLength = Editor.string(editor, []).length;
              const remainingSpace = 1000 - currentLength;
              
              if (remainingSpace <= 0) return;
              
              const trimmedText = pastedText.slice(0, remainingSpace);
              editor.insertText(trimmedText);
            }}
            style={{ minHeight: '100%'}}
            className="focus-visible:outline-none max-h-full overflow-scroll"
            renderElement={renderElement} />
        </Slate>
        <div className="absolute bottom-2 right-2 text-sm text-gray-400">
          {charCount}/1000
        </div>
      </div>
    </>
  )
}

const DefaultElement = (props: RenderElementProps) => {
  return (
    <p {...props.attributes}>
      {props.children}
    </p>
  )
}
