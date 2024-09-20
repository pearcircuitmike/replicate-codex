// CarbonAd.jsx
import React, { useEffect, useRef } from "react";

let carbonAdScriptLoaded = false;
let carbonAdContainer = null;

const CarbonAd = () => {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current) {
      // If the ad container already exists, move it to the new location
      if (carbonAdContainer) {
        adRef.current.appendChild(carbonAdContainer);
      } else {
        // Create a new ad container
        carbonAdContainer = document.createElement("div");
        carbonAdContainer.id = "carbonads";

        adRef.current.appendChild(carbonAdContainer);

        if (!carbonAdScriptLoaded) {
          // Load the Carbon Ads script
          const script = document.createElement("script");
          script.src =
            "//cdn.carbonads.com/carbon.js?serve=CW7DV23J&placement=wwwaimodelsfyi";
          script.id = "_carbonads_js";
          script.async = true;
          carbonAdContainer.appendChild(script);

          carbonAdScriptLoaded = true;
        }
      }
    }

    // Cleanup function to prevent duplication
    return () => {
      if (adRef.current && carbonAdContainer) {
        adRef.current.removeChild(carbonAdContainer);
      }
    };
  }, []);

  return (
    <>
      <div ref={adRef} id="carbon-container" />
      <style jsx global>{`
        /* Your existing styles */
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

export default CarbonAd;
