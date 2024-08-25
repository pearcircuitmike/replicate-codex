import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";

const CarbonAds = () => {
  const router = useRouter();
  const carbonRef = useRef(null);

  useEffect(() => {
    // Function to load the Carbon ad
    const loadCarbonAd = () => {
      if (carbonRef.current && !carbonRef.current.firstChild) {
        const script = document.createElement("script");
        script.src =
          "//cdn.carbonads.com/carbon.js?serve=CW7DV23J&placement=wwwaimodelsfyi";
        script.id = "_carbonads_js";
        script.async = true;
        carbonRef.current.appendChild(script);
      }
    };

    // Load the ad
    loadCarbonAd();

    // Refresh the ad on route change
    const handleRouteChange = () => {
      if (carbonRef.current) {
        // Remove existing ad
        carbonRef.current.innerHTML = "";
        // Load new ad
        loadCarbonAd();
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // Cleanup function
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <div ref={carbonRef} id="carbon-container" />
      <style jsx global>{`
        #carbonads {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", Helvetica, Arial,
            sans-serif;
          display: flex;
          max-width: 330px;
          background-color: #fff;
          box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
        }
        #carbonads a {
          color: inherit;
          text-decoration: none;
        }
        #carbonads a:hover {
          color: inherit;
        }
        #carbonads span {
          position: relative;
          display: block;
          overflow: hidden;
        }
        #carbonads .carbon-wrap {
          display: flex;
        }
        .carbon-img {
          display: block;
          margin-right: 1em;
          line-height: 1;
        }
        .carbon-img img {
          display: block;
        }
        .carbon-text {
          font-size: 13px;
          padding: 10px;
          line-height: 1.5;
          text-align: left;
        }
        .carbon-poweredby {
          display: block;
          padding: 8px 10px;
          background: repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 5px,
              hsla(0, 0%, 0%, 0.025) 5px,
              hsla(0, 0%, 0%, 0.025) 10px
            )
            hsla(203, 11%, 95%, 0.4);
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          font-size: 9px;
          line-height: 1;
        }
      `}</style>
    </>
  );
};

export default CarbonAds;
