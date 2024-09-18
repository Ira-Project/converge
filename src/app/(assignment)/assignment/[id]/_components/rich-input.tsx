'use client';

import { useCallback, useState } from "react"
import { createEditor, Node, type Descendant } from 'slate'
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

  const onChange = useCallback(() => {
    const value = editor.children.map(
      (node) => Node.string(node)).join('\n')
    updateValue(value)
  }, [])

  const renderElement = useCallback((props: RenderElementProps) => {
    switch(props.element.type) {
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  return (
    <>
      <div className="h-full overflow-scroll resize-none p-2 ">
        <Slate
          editor={editor}
          onChange={onChange}
          initialValue={initialValue}>
          <Editable 
            style={{ minHeight: '100%'}}
            className="focus-visible:outline-none max-h-full overflow-scroll"
            renderElement={renderElement} />
        </Slate>
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
