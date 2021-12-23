import { RefObject, useEffect } from "react";

export default function useClickAway(
  refs: RefObject<HTMLElement | null>[],
  cb: () => void
) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!refs.length) return;
      for (const ref of refs) {
        if (ref.current?.contains(e.target as Node)) return;
      }
      cb();
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);
}
