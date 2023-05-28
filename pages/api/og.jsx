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
  const ogModelDescription = searchParams.get("ogModelDescription");

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
          paddingTop: "20px",
          paddingBottom: "20px",
          borderBottom: "25px",
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
            width: "250px",
            height: "250px",
            borderRadius: "5%",
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
              fontSize: "70px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {creator}/
            <span style={{ fontFamily: "LatoBold" }}> {modelName}</span>
          </h1>

          <p
            style={{ fontSize: "35px", marginBottom: "25px", color: "#718096" }}
          >
            {ogModelDescription}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: "30",
              maxWidth: "1000px",
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
                      }}
                    >
                      {toTitleCase(platform)}
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
                      ${costToRun ? costToRun : "?"}
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
                      {avgCompletionTime ? avgCompletionTime : "?"}
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
                      {predictionHardware ? predictionHardware : "N/A"}
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
              maxWidth: "1000px",
              fontSize: "20",
              color: "#718096",
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
                      }}
                    >
                      Prediction Hardware
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
