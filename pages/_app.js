import "../styles/globals.css";
import Layout from "../components/Layout";
import Script from "next/script";
import {
  ChakraProvider,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import RouteGuard from "../utils/routeGuard";
import { useEffect } from "react";
import AuthForm from "../components/AuthForm";

export default function App({ Component, pageProps }) {
  return (
    <>
      <ChakraProvider>
        <AuthProvider>
          <AppContent Component={Component} pageProps={pageProps} />
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}

function AppContent({ Component, pageProps }) {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        onOpen();
      }, 15000); // Open the modal after 15 seconds if the user is not authenticated

      return () => clearTimeout(timer);
    }
  }, [user, onOpen]);

  return (
    <RouteGuard>
      <Box>
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

              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
            `}
          </Script>
          <Script id="microsoft-clarity">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", '${process.env.NEXT_PUBLIC_CLARITY_KEY}');
            `}
          </Script>

          <Component {...pageProps} />
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent p={2}>
              <ModalHeader>Create an account for full access</ModalHeader>

              <ModalBody>
                <AuthForm />
              </ModalBody>
            </ModalContent>
          </Modal>
        </Layout>
      </Box>
    </RouteGuard>
  );
}
