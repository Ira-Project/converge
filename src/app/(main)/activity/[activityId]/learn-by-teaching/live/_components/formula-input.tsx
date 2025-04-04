import FormattedText from '@/components/formatted-text'
import { PlusIcon, TrashIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import posthog from 'posthog-js'
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-row w-full">
        <p className="font-medium text-sm justify-start my-auto"> Enter Formulas Below</p>
        {
          formulaListState.length < 5 &&
          <Button
            className="my-auto justify-end ml-auto"
            size="sm"
            variant="link"
            onClick={(e) => {
              posthog.capture("learn_by_teaching_add_formula_clicked");
              e.preventDefault()
              const newFormula = [...formulaListState, '']
              setFormulaListState(newFormula)
              updateValue(newFormula)
            }}
          >
            <span className="flex flex-row gap-1">
              <PlusIcon /> Add Formula
            </span>
          </Button>
        }
      </div>
      {formulaListState.map((formula, index) => {
          return (
            <div key={index} className="flex flex-row gap-2 mb-4">
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
                    posthog.capture("learn_by_teaching_remove_formula_clicked");
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
      <p className="text-xs text-muted-foreground font-medium">Formula Input Cheat Sheet </p>
      <div className="flex flex-col text-muted-foreground text-xs gap-1">
        <div className="flex flex-row items-center h-5">
          <FormattedText text="1. To add symbols use the '\' key. Eg: $!$\pi$!$ = \pi" />
        </div>
        <div className="flex flex-row items-center h-5">
          <FormattedText text="2. To add exponents use the '^' key. Eg: $!$x^2$!$ = x^2" />
        </div>
        <div className="flex flex-row items-center h-5">
          <FormattedText text="3. To add subscripts use the '_' key. Eg: $!$x_2$!$ = x_2" />
        </div>
        <div className="flex flex-row items-center h-5">
          <FormattedText text="4. To add fractions use the '/' key. Eg: $!$\frac{1}{2}$!$ = 1/2" />
        </div>
        <div className="flex flex-row items-center h-5">
          <FormattedText text="5. To add square roots use the '\\sqrt' key. Eg: $!$\sqrt2$!$ = \sqrt{2}" />
        </div>
      </div>
    </div>
  )
}