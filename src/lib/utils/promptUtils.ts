
export function convertStringArrayToNumberedList(strings: string[]): string {
  return strings.map((string, index) => `${index + 1}) ${string}`).join("\n");
}