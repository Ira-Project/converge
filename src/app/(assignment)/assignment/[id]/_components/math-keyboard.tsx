import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useState } from 'react'
import { addStyles, EditableMathField } from 'react-mathquill'

addStyles()

type MathKeyboardDialogProps = {
  insertHandler: (latex: string) => void
}

export default function MathKeyboardDialog({ insertHandler } : MathKeyboardDialogProps) { 

  const [latex, setLatex] = useState('')

  function onHandleInsert(): void {
    insertHandler(latex)
    setLatex('')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="italic h-8 w-8">
          fx
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-6"> Insert Equation</DialogTitle>
          <EditableMathField
            latex={latex}
            onChange={(mathField) => {
              setLatex(mathField.latex())
            }}
          />
          <div className="pt-4 text-slate-600 text-sm">
            <p>Instructions for using the math keyboard: </p>
            <p> 1. For super scripts use ^, for subscripts use _ </p>
            <p> 2. For fractions simply use / </p>
            <p> 3. For square roots use \sqrt </p>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onHandleInsert}>
              Insert
            </Button>
          </DialogClose>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}