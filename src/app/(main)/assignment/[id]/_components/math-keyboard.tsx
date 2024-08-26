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
          <DialogTitle className="mb-4"> Insert Equation</DialogTitle>
          <EditableMathField
            latex={latex}
            onChange={(mathField) => {
              setLatex(mathField.latex())
            }}
          />
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onHandleInsert}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}