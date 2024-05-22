
export function compareAnswers(computedAnswer: number, actualAnswer: string): boolean {

  const actualAnswerNumber:number = eval(actualAnswer) as number;

  if(Math.abs(computedAnswer - actualAnswerNumber) < 0.001) {
    return true
  }

  return false;
}