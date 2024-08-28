'use client';

import { useCallback, useState } from "react"
import { createEditor, Editor, Node, Path, Transforms, type Descendant } from 'slate'
import { Slate, Editable, withReact, type RenderElementProps } from 'slate-react'

import { type BaseEditor } from 'slate'
import { type ReactEditor } from 'slate-react'

import dynamic from "next/dynamic";
import { LoadingButton } from "@/components/loading-button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

const MathKeyboardDialog = dynamic(() => import('./math-keyboard'), { ssr: false });
const MathElement = dynamic(() => import('./math-element'), { ssr: false });

export type CustomEditor = BaseEditor & ReactEditor

export type ParagraphElement = {
  type: 'paragraph'
  children: CustomText[]
}

export type MathElement = {
  type: 'math'
  children: CustomText[]
  latex: string,
}

export type CustomElement = ParagraphElement | MathElement;
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
  { updateValue, loading, disabled } : 
  { updateValue: (value: string) => void, loading: boolean, disabled: boolean }) {

  const [editor] = useState(() => withReact(createEditor()))

  const onChange = useCallback(() => {
    const value = editor.children.map(
      (node) => Node.string(node)).join('\n')
    updateValue(value)
  }, [])

  const renderElement = useCallback((props: RenderElementProps) => {
    switch(props.element.type) {
      case 'math':
        return <MathElement 
          latex={props.element.latex}
          elementProps={props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const addMathBlock = (latex: string) => {
    Editor.insertNode(editor, { type: 'math', children: [{ text: ''}], latex: latex })
    Editor.insertNode(editor, { type: 'paragraph', children: [{ text: '' }] })
  }

  return (
    <>
      <div className="h-full resize-none p-4 pr-8 border-solid border-slate-100 border-2">
        <Slate
          editor={editor}
          onChange={onChange}
          initialValue={initialValue}>
          <Editable 
            style={{ minHeight: '100%'}}
            className="focus-visible:outline-none max-h-full"
            renderElement={renderElement} />
        </Slate>
      </div>
      <div className="flex -translate-y-12">
        <div className="justify-start items-center mr-auto ml-4">
          <MathKeyboardDialog
            insertHandler={addMathBlock} />
        </div>
        <div className="justify-end items-center ml-auto mr-4">
          <LoadingButton 
            dontShowChildrenWhileLoading
            loading={loading}
            disabled={disabled}
            className="p-2 h-8 w-8"
            type="submit">
              <PaperPlaneIcon />
          </LoadingButton>
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
