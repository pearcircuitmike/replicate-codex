import { ImageResponse } from "@vercel/og";

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("image");

    // Function to truncate text with ellipsis
    const truncateWithEllipsis = (text, maxLength) => {
      return text.length > maxLength
        ? text.slice(0, maxLength - 3) + "..."
        : text;
    };

    // Truncate title and subtitle with ellipsis if they exceed certain lengths
    const title = truncateWithEllipsis(
      searchParams.get("title") || "AImodels.fyi",
      45
    );
    const subtitle = truncateWithEllipsis(
      searchParams.get("subtitle") ||
        "The all-in-one place for AI research, models, tools, and more!",
      150
    );

    // Function to generate a gradient based on the title
    const generateGradient = (title) => {
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
      const hash = title
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const color1 = colors[hash % colors.length];
      const color2 = colors[(hash + 1) % colors.length];
      return `linear-gradient(to right, ${color1}, ${color2})`;
    };

    const gradientBg = generateGradient(title);

    // Define the content to be displayed
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
          <span style={{ position: "absolute", top: "40px", left: "40px" }}>
            <img
              src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png"
              alt="Logo"
              style={{ width: "30px", height: "30px" }}
            />
            <span
              style={{
                fontSize: "25px",
                fontWeight: "normal",

                paddingLeft: "10px",
              }}
            >
              AImodels.fyi
            </span>
          </span>
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
              justifyContent: "flex-end", // Ensures that the content is aligned to the end of the parent
              alignItems: "center", // Vertically center the content within the parent
              width: "460px",
            }}
          >
            {imageUrl && imageUrl !== "null" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center", // Center vertically in the flex container
                  justifyContent: "flex-end", // align horizontally in the flex container
                  height: "504px",
                  width: "504px",
                  borderRadius: "0px 20px 20px 0px",
                }}
              >
                <img
                  src={imageUrl}
                  width="504"
                  height="504"
                  style={{
                    objectFit: "cover",
                    backgroundColor: "white",
                    borderRadius: "0px 20px 20px 0px",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://cdn.dribbble.com/users/63554/screenshots/10844959/media/d6e4f9ccef4cce39198a4b958d0cb47f.jpg";
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center", // Center vertically in the flex container
                  justifyContent: "flex-end", // align horizontally in the flex container
                  height: "504px",
                  width: "504px",
                  borderRadius: "0px 20px 20px 0px",
                }}
              >
                <img
                  src="https://cdn.dribbble.com/users/63554/screenshots/10844959/media/d6e4f9ccef4cce39198a4b958d0cb47f.jpg"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    borderRadius: "0px 20px 20px 0px",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );

    // Return the image response
    return new ImageResponse(content, {
      width: 1200,
      height: 630,
    });
  } catch (e) {
    console.error(`Error generating image: ${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
