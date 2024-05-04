import Head from "next/head";

export default function MetaTags({
  title = "AI Models",
  description = "Explore the world of AI Models.",
  socialPreviewImage = "",
  socialPreviewTitle = "",
  socialPreviewSubtitle = "",
}) {
  // Access the environment variable; it returns a string
  const baseUrl = process.env.NEXT_PUBLIC_SITE_BASE_URL;

  // Construct the URL with encoded parameters for dynamic social media images
  const ogImageUrl = `${baseUrl}/api/og?image=${encodeURIComponent(
    socialPreviewImage
  )}&title=${encodeURIComponent(
    socialPreviewTitle
  )}&subtitle=${encodeURIComponent(socialPreviewSubtitle)}`;

  return (
    <Head>
      <meta httpEquiv="content-language" content="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={baseUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImageUrl} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
