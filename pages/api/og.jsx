// /api/og.js

import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Hardcode the absolute URL for your fallback image
    const fallbackUrl = "https://www.aimodels.fyi/og-fallback.webp";

    // Look for "image" in the query string
    const imageUrlParam = searchParams.get("image");

    // Use fallback if no valid image URL is provided
    const finalImageUrl =
      imageUrlParam && imageUrlParam !== "null" ? imageUrlParam : fallbackUrl;

    // Helper function to truncate text
    const truncateWithEllipsis = (text, maxLength) => {
      return text.length > maxLength
        ? text.slice(0, maxLength - 3) + "..."
        : text;
    };

    // Read and truncate title/subtitle
    const title = truncateWithEllipsis(
      searchParams.get("title") || "AImodels.fyi",
      45
    );
    const subtitle = truncateWithEllipsis(
      searchParams.get("subtitle") ||
        "The all-in-one place for AI research, models, tools, and more!",
      150
    );

    // Generate a gradient background based on the title text
    const generateGradient = (titleText) => {
      const colors = [
        "#ff6347", // tomato
        "#e91e63", // pink
        "#9c27b0", // purple
        "#673ab7", // deep purple
        "#3f51b5", // indigo
        "#2196f3", // blue
        "#03a9f4", // light blue
        "#00bcd4", // cyan
        "#009688", // teal
      ];
      const hash = [...titleText].reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0
      );
      const color1 = colors[hash % colors.length];
      const color2 = colors[(hash + 1) % colors.length];
      return `linear-gradient(to right, ${color1}, ${color2})`;
    };

    const gradientBg = generateGradient(title);

    // Main content layout for the OG image
    const content = (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          background: gradientBg,
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F7FAFC",
            borderRadius: "20px",
            height: "80vh",
            width: "1100px",
            paddingLeft: "40px",
            paddingTop: "0px",
            paddingBottom: "0px",
            paddingRight: "0px",
            boxSizing: "border-box",
          }}
        >
          {/* Text Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "600px",
              paddingRight: "100px",
            }}
          >
            <div
              style={{
                fontSize: "45px",
                fontWeight: "normal",
                marginBottom: "10px",
                marginTop: "20px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "25px",
                fontWeight: "normal",
                color: "#718096",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Image Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "460px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "504px",
                width: "504px",
                borderRadius: "0px 20px 20px 0px",
              }}
            >
              <img
                src={finalImageUrl}
                width="504"
                height="504"
                style={{
                  objectFit: "cover",
                  backgroundColor: "white",
                  borderRadius: "0px 20px 20px 0px",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackUrl;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );

    // Return the image as JPEG
    return new ImageResponse(content, {
      width: 1200,
      height: 630,
      quality: 10, // This often has limited effect, but can stay
      contentType: "image/jpeg",
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=2592000",
      },
    });
  } catch (e) {
    console.error(`Error generating image: ${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
