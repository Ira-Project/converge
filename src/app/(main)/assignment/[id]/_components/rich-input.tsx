'use client';

import { useCallback, useState } from "react"
import { createEditor, Editor, type Descendant } from 'slate'
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
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'A second line of text in a paragraph.' }],
  },
] as Descendant[]

export function RichInput() {

  const [editor] = useState(() => withReact(createEditor()))

  if(typeof window !== 'undefined') {
    
  }
  
  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback((props: RenderElementProps) => {
    switch(props.element.type) {
      case 'math':
        return <MathElement text={props.element.children[0]?.text} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const addMathBlock = (latex: string) => {
    Editor.insertNode(editor, { type: 'math', children: [{ text: latex }] })
    Editor.insertNode(editor, { type: 'paragraph', children: [{ text: '' }] })
  }

  return (
    <>
      <div className="h-full resize-none p-2 pr-8 border-solid border-slate-100 border-2">
        <Slate
          editor={editor}
          initialValue={initialValue}>
          <Editable 
            className="focus-visible:outline-none"
            renderElement={renderElement} />
        </Slate>
      </div>
      <div className="flex">
        <div className="justify-start mr-auto ml-4 p-2 h-8 w-8">
          <MathKeyboardDialog
            insertHandler={addMathBlock} />
        </div>
        <LoadingButton 
          dontShowChildrenWhileLoading
          // disabled={!form.formState.isDirty || explanationMutation.isLoading || !isSubscribed} 
          // loading={explanationMutation.isLoading || !isSubscribed}
          className="justify-end ml-auto mr-4 p-2 h-8 w-8">
            <PaperPlaneIcon />
        </LoadingButton>
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
