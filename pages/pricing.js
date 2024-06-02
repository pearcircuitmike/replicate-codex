// pages/pricing.js
import Pricing from "@/components/ui/Pricing";
import supabase from "@/utils/supabaseClient";
import { Box, Text, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";

export async function getServerSideProps() {
  try {
    const { data: user } = await supabase.auth.getUser();

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*, prices(*)")
      .eq("active", true)
      .eq("prices.active", true)
      .order("metadata->index")
      .order("unit_amount", { referencedTable: "prices" });

    if (productsError) {
      throw productsError;
    }

    return {
      props: {
        user,
        products: products || [],
        subscription,
      },
    };
  } catch (error) {
    console.error("Error fetching pricing data:", error.message);
    return {
      props: {
        user: null,
        products: [],
        subscription: null,
        error: error.message,
      },
    };
  }
}

function PricingPage({ user, products, subscription, error }) {
  const toast = useToast();
  const router = useRouter();

  if (error) {
    toast({
      title: "Error",
      description: error,
      status: "error",
      duration: 9000,
      isClosable: true,
    });
  }

  return (
    <Box>
      {error ? (
        <Text fontSize="xl" color="red.500">
          An error occurred: {error}
        </Text>
      ) : (
        <Pricing user={user} products={products} subscription={subscription} />
      )}
    </Box>
  );
}

export default PricingPage;
