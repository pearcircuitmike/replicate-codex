import "../styles/globals.css";
import Layout from "../components/Layout";
import Script from "next/script";
import {
  ChakraProvider,
  Box,
  Text,
  IconButton,
  Collapse,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";

export default function App({ Component, pageProps }) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  return (
    <>
      <ChakraProvider>
        <Collapse in={isOpen} animateOpacity>
          <Box
            bg="black"
            color="white"
            textAlign="center"
            p={2}
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={1000}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text
              flexGrow={1}
              cursor="pointer"
              onClick={() =>
                window.open("https://aimodels.substack.com/", "_blank")
              }
            >
              Get a weekly rundown of the latest AI models and research...
              subscribe!{" "}
              <Text as="span" textDecoration="underline">
                https://aimodels.substack.com/
              </Text>
            </Text>
            <IconButton
              aria-label="Close"
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={onToggle}
            />
          </Box>
        </Collapse>
        <Box pt={isOpen ? "40px" : 0} transition="padding-top 0.3s">
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
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4489327921275613"
              crossOrigin="anonymous"
            ></Script>

            <Script
              id="popup"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
    console.log('Script loaded');
    // Define and immediately invoke the function to show popup if conditions are met
    (function() {
      console.log('Function execution started');

      var lastVisit = localStorage.getItem('lastVisitTimestamp');
      var currentTime = new Date().getTime();
      console.log('Last Visit:', lastVisit);
      console.log('Current Time:', currentTime);

      // 604800000 is equivalent to 7 days in milliseconds
      if (!lastVisit || currentTime - lastVisit > 604800000) {
        console.log('Showing popup after 15 seconds');
        setTimeout(function() {
          showMailingListPopup();
        }, 5000); // After 5 seconds
      } else {
        console.log('No need to show popup, within the visit time frame');
      }
    })();

    function showMailingListPopup() {
      console.log('Executing showMailingListPopup');

      // Create overlay div
      var overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
      overlay.style.zIndex = '1000';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      document.body.appendChild(overlay);
      console.log('Overlay added to body');

      // Wrapper to control the width and centering of the iframe
      var wrapper = document.createElement('div');
      wrapper.style.maxWidth = '90%';
      wrapper.style.width = '100%';
      wrapper.style.position = 'relative';
      overlay.appendChild(wrapper);

      // Embed the iframe into the wrapper
      var iframe = document.createElement('iframe');
      iframe.src = 'https://aimodels.substack.com/embed';
      iframe.style.width = '100%';
      iframe.style.height = '320px';
      iframe.style.border = '1px solid #EEE';
      iframe.style.background = 'white';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      wrapper.appendChild(iframe);

      var closeButton = document.createElement('span');
      closeButton.innerHTML = '&times;';
      closeButton.style.position = 'absolute';
      closeButton.style.right = '10px';
      closeButton.style.top = '10px';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.color = '#FFF';
      closeButton.style.background = 'rgba(0, 0, 0, 0.6)';
      closeButton.style.borderRadius = '50%';
      closeButton.style.width = '30px';
      closeButton.style.height = '30px';
      closeButton.style.lineHeight = '30px';
      closeButton.style.textAlign = 'center';
      closeButton.style.zIndex = '1001';
      wrapper.appendChild(closeButton);
      console.log('Close button added');

      // Update the last visit timestamp
      localStorage.setItem('lastVisitTimestamp', new Date().getTime());

      // Close the popup if the overlay is clicked
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          document.body.removeChild(overlay);
          console.log('Overlay clicked and removed');
        }
      });

      // Close the popup if the close button is clicked
      closeButton.addEventListener('click', function () {
        document.body.removeChild(overlay);
        console.log('Close button clicked and overlay removed');
      });
    }`,
              }}
            />

            <Component {...pageProps} />
          </Layout>
        </Box>
      </ChakraProvider>
    </>
  );
}
