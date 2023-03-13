import Head from "next/head";

export default function MetaTags({ title, description }) {
  return (
    <Head>
      <meta httpEquiv="content-language" content="en-us" />

      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      <meta property="og:url" content="https://replicatecodex.com" />
      <meta
        property="og:image"
        content="https://replicatecodex.com/socialImg.png"
      />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:description" content={description} />
      <meta
        property="twitter:image"
        content="https://replicatecodex.com/socialImg.png"
      />

      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
