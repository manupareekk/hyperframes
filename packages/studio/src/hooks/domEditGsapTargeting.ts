import { STUDIO_GSAP_DRAG_INTERCEPT_ENABLED } from "../components/editor/manualEditingAvailability";

type TimelineLike = { getChildren?: (nested: boolean) => Array<{ targets?: () => Element[] }> };

// fallow-ignore-next-line complexity
export function isElementGsapTargeted(
  iframe: HTMLIFrameElement | null,
  element: HTMLElement,
): boolean {
  // When the GSAP drag intercept is disabled for debugging, treat every
  // element as un-targeted so commits take the plain CSS persist path.
  if (!STUDIO_GSAP_DRAG_INTERCEPT_ENABLED) return false;
  if (!iframe?.contentWindow) return false;
  let timelines: Record<string, TimelineLike> | undefined;
  try {
    timelines = (iframe.contentWindow as Window & { __timelines?: Record<string, TimelineLike> })
      .__timelines;
  } catch {
    return false;
  }
  if (!timelines) return false;
  const id = element.id;
  for (const tl of Object.values(timelines)) {
    if (!tl?.getChildren) continue;
    try {
      for (const child of tl.getChildren(true)) {
        if (!child.targets) continue;
        for (const t of child.targets()) {
          if (t === element || (id && t.id === id)) return true;
        }
      }
    } catch {
      continue;
    }
  }
  return false;
}
