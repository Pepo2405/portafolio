export function parseObject(arr: { title: string }[]): {
  [key: string]: boolean;
} {
  const obj: { [key: string]: boolean } = {};
  arr.forEach((item) => {
    obj[item.title] = false;
  });
  return obj;
}

export function idGen(length = 5) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
