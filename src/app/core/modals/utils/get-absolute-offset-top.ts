export function getAbsoluteOffsetTop(el: HTMLElement): number {
  let offsetTop = 0;
  let node: HTMLElement | null = el;
  while (node) {
    offsetTop += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return offsetTop;
}
