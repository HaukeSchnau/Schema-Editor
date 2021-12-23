import { useEffect, useRef } from "react";

export default function useInterval(
  cb: () => void,
  interval: number,
  deps: unknown[] = []
) {
  const handle = useRef<number | null>();
  useEffect(() => {
    handle.current = window.setInterval(cb, interval);
    return () => {
      if (handle.current) clearInterval(handle.current);
    };
  }, deps);
}
