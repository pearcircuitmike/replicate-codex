// hooks/usePageView.js
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { trackEvent } from "../pages/api/utils/analytics-util";

export function usePageView() {
  const router = useRouter();
  const lastTrackedPath = useRef("");

  useEffect(() => {
    const handleRouteChange = (url) => {
      // Only track if the path has actually changed
      if (url !== lastTrackedPath.current) {
        trackEvent("page_view", { page: url });
        lastTrackedPath.current = url;
      }
    };

    // Track the initial page load, but only once (i hope)
    if (lastTrackedPath.current !== router.asPath) {
      trackEvent("page_view", { page: router.asPath });
      lastTrackedPath.current = router.asPath;
    }

    // Track subsequent route changes
    router.events.on("routeChangeComplete", handleRouteChange);

    // Cleanup the event listener
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);
}
