export const performCalculation = (input: string | number) : number => {
  if (typeof input !== "string") {
    return input;
  }
  const stringArray = input.split("(");
  const operation = stringArray[0];
  const remainingString = stringArray[1];
  const inputs = remainingString?.split(")")[0]?.split(",") ?? [];
  switch (operation) {
    case "add":
      let sum = 0;
      for (const num of inputs) {
        sum += parseFloat(num.trim());
      }
      return sum;
    case "multiply":
      let prod = 1;
      for (const num of inputs) {
        prod *= parseFloat(num.trim());
      }
      return prod;
    case "subtract":
      let sub = 0;
      let startSub = true;
      for (const num of inputs) {
        if (startSub) {
          sub = parseFloat(num.trim());
          startSub = false;
        } else {
          sub -= parseFloat(num.trim());
        }
      }
      return sub;
    case "divide":
      let div = 1;
      let startDivide = true;
      for (const num of inputs) {
        if (startDivide) {
          div = parseFloat(num.trim());
          startDivide = false;
        } else {
          div /= parseFloat(num.trim());
        }
      }
      return div;
    default:
      return parseFloat(input);
  }
}