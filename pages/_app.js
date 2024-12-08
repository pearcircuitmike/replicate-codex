// pages/_app.js

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
  useToast,
} from "@chakra-ui/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { useEffect, useState, useCallback } from "react";
import AuthForm from "@/components/AuthForm";
import { usePageView } from "../hooks/usePageView";
import Head from "next/head";
import { FoldersProvider } from "@/context/FoldersContext";
import supabase from "@/pages/api/utils/supabaseClient";

function AppContent({ Component, pageProps }) {
  const { user, loading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Use the custom hook for page view tracking
  usePageView();

  const [folders, setFolders] = useState([]);

  // Function to fetch folders
  const fetchFolders = useCallback(async () => {
    if (!user) {
      setFolders([]);
      return;
    }

    try {
      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("id, name, color, position")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      if (folderError) throw folderError;

      const foldersWithCounts = await Promise.all(
        folderData.map(async (folder) => {
          const { count, error: countError } = await supabase
            .from("bookmarks")
            .select("id", { count: "exact", head: true })
            .eq("folder_id", folder.id)
            .eq("user_id", user.id);

          if (countError) throw countError;

          return {
            ...folder,
            bookmarkCount: count || 0,
          };
        })
      );

      setFolders(foldersWithCounts);
      console.log("Fetched folders:", foldersWithCounts);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error fetching folders",
        description: error.message || "An unexpected error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, toast]);

  // Function to update folder count
  const updateFolderCount = useCallback((folderId, increment) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              bookmarkCount: folder.bookmarkCount + (increment ? 1 : -1),
            }
          : folder
      )
    );
    console.log(`Updated folder ${folderId} count by ${increment ? 1 : -1}`);
  }, []);

  // Fetch folders when user changes
  useEffect(() => {
    if (user) {
      fetchFolders();
    } else {
      setFolders([]);
    }
  }, [user, fetchFolders]);

  // Open modal after 50 seconds for unauthenticated users
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        onOpen();
      }, 500000); // Open the modal after 500 seconds if the user is not authenticated
      return () => clearTimeout(timer);
    }
  }, [user, onOpen]);

  return (
    <FoldersProvider
      fetchFolders={fetchFolders}
      updateFolderCount={updateFolderCount}
      folders={folders}
    >
      <RouteGuard>
        <Box>
          <Layout>
            {/* Analytics and Tracking Scripts */}
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
            {/* Google Adsense tag */}
            <Script id="google-adsense" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-16682209532');
              `}
            </Script>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=AW-16682209532"
              strategy="afterInteractive"
            />
            {/* Main Component */}
            <Component {...pageProps} loading={loading} />
            {/* Authentication Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent p={2}>
                <ModalHeader>Create an account for full access</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <AuthForm signupSource="app-popup" />
                </ModalBody>
              </ModalContent>
            </Modal>
          </Layout>
        </Box>
      </RouteGuard>
    </FoldersProvider>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}
