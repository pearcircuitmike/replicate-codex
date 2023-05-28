import Head from "next/head";

export default function MetaTags({
  title,
  description,
  creator,
  modelName,
  ogImgUrl,
  platform,
  tags,
  costToRun,
  avgCompletionTime,
  predictionHardware,
}) {
  const params = new URLSearchParams({
    creator,
    modelName,
    description,
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
