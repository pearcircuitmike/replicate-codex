// styles/theme.js
import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  colors: {
    primary: "#2B6CB0",
    secondary: "#2C5282",
    // Add any additional custom colors here
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  styles: {
    global: {
      "html, body": {
        color: "gray.800",
      },
    },
  },
});

export default customTheme;
