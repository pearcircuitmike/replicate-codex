import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

// Make sure the font exists in the specified path:
const fontRegular = fetch(
  new URL("../../assets/Lato-Regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

const fontBold = fetch(
  new URL("../../assets/Lato-Bold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

const fontLight = fetch(
  new URL("../../assets/Lato-Light.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler(request) {
  const fontRegularData = await fontRegular;
  const fontBoldData = await fontBold;
  const fontLightData = await fontLight;
  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const { searchParams } = request.nextUrl;
  const creator = searchParams.get("creator");
  const modelName = searchParams.get("modelName");
  const description = searchParams.get("description");
  const ogImgUrl = decodeURIComponent(searchParams.get("ogImgUrl"));

  const platform = searchParams.get("platform");
  const tags = searchParams.get("tags");
  const costToRun = searchParams.get("costToRun");
  const avgCompletionTime = searchParams.get("avgCompletionTime");
  const predictionHardware = searchParams.get("predictionHardware");

  if (!creator || !modelName || !description) {
    return new ImageResponse(
      (
        <>
          Visit with parameters:
          ?creator=John&modelName=MyModel&description=This is my
          model&ogImgUrl=https://example.com/image.png
        </>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "40px",
          paddingBottom: "20px",
          borderBottom: "15px",
          borderColor: "#5a91a0",
          fontFamily: "LatoRegular",
          backgroundColor: "white",
        }}
      >
        <img
          src={
            ogImgUrl ||
            "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
          }
          alt="Model Image"
          style={{
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {creator}/
            <span style={{ fontFamily: "LatoBold" }}> {modelName}</span>
          </h1>

          <p style={{ fontSize: "20px", marginBottom: "32px" }}>
            {description}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: "20",
              maxWidth: "800px",
            }}
          >
            <table>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "4px 16px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    {toTitleCase(platform)}
                  </td>
                  <td
                    style={{
                      padding: "4px 16px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    <span
                      style={{
                        margin: "auto",
                      }}
                    >
                      {costToRun}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "4px 16px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    <span
                      style={{
                        margin: "auto",
                      }}
                    >
                      {avgCompletionTime}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "4px 16px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    <span
                      style={{
                        margin: "auto",
                      }}
                    >
                      {predictionHardware}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              maxWidth: "800px",
            }}
          >
            <table>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "4px 16px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    <span
                      style={{
                        margin: "auto",
                        fontFamily: "LatoLight",
                      }}
                    >
                      Platform
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "4px 16px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    <span
                      style={{
                        margin: "auto",
                        fontFamily: "LatoLight",
                      }}
                    >
                      Cost To Run
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "4px 16px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    <span
                      style={{
                        margin: "auto",
                        fontFamily: "LatoLight",
                      }}
                    >
                      Avg Completion Time
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "4px 16px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    <span
                      style={{
                        margin: "auto",
                        fontFamily: "LatoLight",
                      }}
                    >
                      Prediction Hardware
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p
            style={{
              fontSize: "20px",
              fontFamily: "LatoRegular",
              marginTop: "32px",
            }}
          >
            Click to view more on AIModels.fyi
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "LatoRegular",
          data: fontRegularData,
          style: "regular",
        },
        {
          name: "LatoBold",
          data: fontBoldData,
          style: "bold",
        },
        {
          name: "LatoLight",
          data: fontLightData,
          style: "light",
        },
      ],
    }
  );
}
