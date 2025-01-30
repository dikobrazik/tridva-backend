export const buildPathForChildren = (
  parentId: string | number,
  childrenLevel: number,
) => {
  if (childrenLevel < 2) throw Error('Children level should me more than 2');

  if (childrenLevel === 2) {
    return `${parentId}.%`;
  }

  if (childrenLevel > 2) {
    return `%.${parentId}.%`;
  }
};
