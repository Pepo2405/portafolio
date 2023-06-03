export function parseObject(arr: { title: string }[]): { [key: string]: boolean } {
  const obj: { [key: string]: boolean } = {};
  arr.forEach(item => {
    obj[item.title] = false;
  });
  return obj;
}

