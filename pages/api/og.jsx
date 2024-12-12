import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

// Fallback image URL
const DEFAULT_IMAGE_URL =
  "https://cdn.dribbble.com/users/63554/screenshots/10844959/media/d6e4f9ccef4cce39198a4b958d0cb47f.jpg";

// Implement caching using Edge Runtime
export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("image");

    // Generate cache key from parameters
    const cacheKey = JSON.stringify({
      title: searchParams.get("title"),
      subtitle: searchParams.get("subtitle"),
      image: imageUrl,
    });

    // Check cache first
    const cache = caches.default;
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Function to truncate text
    const truncateWithEllipsis = (text, maxLength) =>
      text?.length > maxLength
        ? text.slice(0, maxLength - 3) + "..."
        : text || "";

    // Truncate with smaller maximum lengths
    const title = truncateWithEllipsis(
      searchParams.get("title") || "AImodels.fyi",
      40
    );
    const subtitle = truncateWithEllipsis(
      searchParams.get("subtitle") ||
        "The all-in-one place for AI research, models, tools, and more!",
      100
    );

    // Simplified gradient generation with fewer colors
    const generateGradient = (title) => {
      const colors = ["#ff6347", "#9c27b0", "#2196f3", "#009688"];
      const hash = title
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const color1 = colors[hash % colors.length];
      const color2 = colors[(hash + 1) % colors.length];
      return `linear-gradient(to right, ${color1}, ${color2})`;
    };

    // Optimize image loading
    let imageElement;
    if (imageUrl && imageUrl !== "null") {
      try {
        // Add timeout to image fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            Accept: "image/webp,image/avif,image/jpeg", // Prefer efficient formats
          },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          imageElement = (
            <img
              src={imageUrl}
              width="504"
              height="504"
              style={{
                objectFit: "cover",
                backgroundColor: "white",
                borderRadius: "0px 20px 20px 0px",
              }}
            />
          );
        } else {
          throw new Error("Image fetch failed");
        }
      } catch {
        imageElement = (
          <img
            src={DEFAULT_IMAGE_URL}
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              borderRadius: "0px 20px 20px 0px",
            }}
          />
        );
      }
    } else {
      imageElement = (
        <img
          src={DEFAULT_IMAGE_URL}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            borderRadius: "0px 20px 20px 0px",
          }}
        />
      );
    }

    const content = (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          background: generateGradient(title),
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
            padding: "0 0 0 40px",
            boxSizing: "border-box",
          }}
        >
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
              {imageElement}
            </div>
          </div>
        </div>
      </div>
    );

    // Generate image response
    const imageResponse = new ImageResponse(content, {
      width: 1200,
      height: 630,
      // Enable compression
      compress: true,
    });

    // Cache the response for 24 hours
    const response = new Response(imageResponse.body, imageResponse);
    response.headers.set("Cache-Control", "public, max-age=86400");
    await cache.put(cacheKey, response.clone());

    return response;
  } catch (e) {
    console.error(`Error generating image: ${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
