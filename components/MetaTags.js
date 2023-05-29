import Head from "next/head";

export default function MetaTags({
  title = "AI Models", // default title
  description = "Explore the world of AI Models.", // default description
  ogModelDescription = "",
  creator = "",
  modelName = "",
  ogImgUrl = "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg", // default image url
  platform = "",
  tags = "",
  costToRun = "",
  avgCompletionTime = "",
  predictionHardware = "",
}) {
  const params = new URLSearchParams({
    creator,
    modelName,
    description,
    ogModelDescription,
    ogImgUrl,
    platform,
    tags,
    costToRun,
    avgCompletionTime,
    predictionHardware,
  });

  const ogImageUrl = `https://aimodels.fyi/api/og?${params.toString()}`;

  return (
    <Head>
      <meta httpEquiv="content-language" content="en-us" />

      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      <meta property="og:url" content="https://aimodels.fyi" />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImageUrl} />

      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
