import "../styles/globals.css";
import Layout from "../components/Layout";
import Script from "next/script";
import { ChakraProvider } from "@chakra-ui/react";
import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    Crisp.configure("854812c2-86af-48d6-9e51-a52c31640751");
  }, []);

  return (
    <>
      <ChakraProvider>
        <Layout>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');`}
          </Script>
          <Script id="microsoft-clarity">
            {`
           (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script",     '${process.env.NEXT_PUBLIC_CLARITY_KEY}');

        `}
          </Script>
          <Script
            id="crisp"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.$crisp=[];window.CRISP_WEBSITE_ID="854812c2-86af-48d6-9e51-a52c31640751";
              (function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`,
            }}
          />

          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4489327921275613"
            crossOrigin="anonymous"
          ></Script>

          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </>
  );
}
