import { useEffect, useState } from "react";

/** Tracks a media query; defaults to Tailwind's `md` breakpoint. */
export default function useIsMobile(query = "(max-width: 767px)"): boolean {
  const [mobile, setMobile] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return mobile;
}
