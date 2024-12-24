import { PlusIcon, TrashIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { addStyles, EditableMathField } from 'react-mathquill'

addStyles()

type FormulaInputType = {
  formulaList: string[]
  updateValue: (value: string[]) => void
}

export default function FormulaInput({ formulaList, updateValue } : FormulaInputType) { 

  const [formulaListState, setFormulaListState] = useState<string[]>(formulaList)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row w-full">
        <p className="font-semibold justify-start my-auto"> Enter Formulas Below</p>
        {
          formulaListState.length < 5 &&
          <Button
            className="my-auto justify-end ml-auto"
            size="sm"
            variant="link"
            onClick={(e) => {
              e.preventDefault()
              const newFormula = [...formulaListState, '']
              setFormulaListState(newFormula)
              updateValue(newFormula)
            }}
          >
            <span className="flex flex-row gap-1">
              <PlusIcon />  Add Formula
            </span>
          </Button>
        }
      </div>
      {formulaListState.map((formula, index) => {
          return (
            <div key={index} className="flex flex-row gap-2">
              <EditableMathField
                style={{ 
                  width: '100%', 
                  padding: '5px 8px', 
                  outline: 'none', 
                  border: 'none', 
                  background: 'white',               
                }}
                latex={formula}
                onChange={(mathField) => {
                  const newFormula = [...formulaListState]
                  newFormula[index] = mathField.latex()
                  setFormulaListState(newFormula)
                  updateValue(newFormula)
                }}
              />
              {
                formulaListState.length > 1 &&
                <Button
                  size="sm"
                  className="bg-red-300 text-white"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    const newFormula = [...formulaListState]
                    newFormula.splice(index, 1)
                    setFormulaListState(newFormula)
                    updateValue(newFormula)
                  }}
                >
                  <TrashIcon />
                </Button>
              }
            </div>
          )
      })}
    </div>
  )
}