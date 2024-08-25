import React, { useEffect } from "react";
import { Box } from "@chakra-ui/react";

const CarbonAd = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.type = "text/javascript";
    script.src =
      "//cdn.carbonads.com/carbon.js?serve=CW7DV23J&placement=wwwaimodelsfyi&format=cover";
    script.id = "_carbonads_js";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Box
      id="carbon-cover"
      sx={{
        "#carbonads": {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", Helvetica, Arial, sans-serif',
        },
        ".carbon-wrap": {
          display: "flex",
          margin: "1em 0",
        },
        ".carbon-img": {
          marginRight: "1em",
          img: {
            display: "block",
          },
        },
        ".carbon-text": {
          fontSize: "0.9em",
          lineHeight: 1.5,
          textDecoration: "none",
        },
        ".carbon-poweredby": {
          display: "block",
          marginTop: "0.5em",
          fontSize: "0.8em",
          lineHeight: 1,
          textDecoration: "none",
        },
      }}
    />
  );
};

export default CarbonAd;
