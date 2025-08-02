export type DiffLine = {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
};

export function getDiffLines(oldStr: string, newStr: string): DiffLine[] {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const diff: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (
      i < oldLines.length &&
      j < newLines.length &&
      oldLines[i] === newLines[j]
    ) {
      diff.push({ type: 'unchanged', text: oldLines[i] });
      i++;
      j++;
    } else if (
      j < newLines.length &&
      (!oldLines[i] || oldLines[i] !== newLines[j])
    ) {
      diff.push({ type: 'added', text: newLines[j] });
      j++;
    } else if (
      i < oldLines.length &&
      (!newLines[j] || oldLines[i] !== newLines[j])
    ) {
      diff.push({ type: 'removed', text: oldLines[i] });
      i++;
    } else {
      i++;
      j++;
    }
  }

  return diff;
}
