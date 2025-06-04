export const getEmojiFromUnified = (emojiUnified: string) => {
  let symbol = emojiUnified.split("-");
  let codesArray: Array<string> = [];

  symbol.forEach((element) => codesArray.push("0x" + element));
  let emoji = String.fromCodePoint(
    ...codesArray.map((code) => parseInt(code, 16))
  );
  return emoji;
};
