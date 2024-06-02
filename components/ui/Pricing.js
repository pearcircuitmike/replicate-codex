// components/ui/Pricing/Pricing.jsx
"use client";

import { Box, Button, Flex, Text, useToast } from "@chakra-ui/react";
import { getStripe } from "@/utils/stripe/client";
import { checkoutWithStripe } from "@/utils/stripe/server";
import { getErrorRedirect } from "@/utils/helpers";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Pricing({ user, products, subscription }) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState("month");
  const [priceIdLoading, setPriceIdLoading] = useState();
  const toast = useToast();

  const handleStripeCheckout = async (price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push("/signin/signup");
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      router.asPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          router.asPath,
          "An unknown error occurred.",
          "Please try again later or contact a system administrator."
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  if (!products.length) {
    return (
      <Box bg="black" maxW="6xl" mx="auto" p={[4, 6, 8]}>
        <Text
          fontSize={["4xl", "6xl"]}
          fontWeight="extrabold"
          color="white"
          textAlign="center"
        >
          No subscription pricing plans found. Create them in your{" "}
          <a
            href="https://dashboard.stripe.com/products"
            rel="noopener noreferrer"
            target="_blank"
            style={{ color: "pink.500", textDecoration: "underline" }}
          >
            Stripe Dashboard
          </a>
          .
        </Text>
      </Box>
    );
  } else {
    return (
      <Box bg="black" maxW="6xl" mx="auto" p={[4, 24, 8]}>
        <Flex direction="column" align="center">
          <Text
            fontSize={["4xl", "6xl"]}
            fontWeight="extrabold"
            color="white"
            textAlign="center"
          >
            Pricing Plans
          </Text>
          <Text
            mt={5}
            fontSize={["xl", "2xl"]}
            color="zinc.200"
            textAlign="center"
          >
            Start building for free, then add a site plan to go live. Account
            plans unlock additional features.
          </Text>
          <Flex
            mt={6}
            bg="zinc.900"
            rounded="lg"
            p="0.5"
            borderColor="zinc.800"
            borderWidth="1px"
            justify="center"
          >
            {intervals.map((interval) => (
              <Button
                key={interval}
                onClick={() => setBillingInterval(interval)}
                bg={billingInterval === interval ? "zinc.700" : "transparent"}
                color={billingInterval === interval ? "white" : "zinc.400"}
                _focus={{
                  outline: "none",
                  ring: "2",
                  ringColor: "pink.500",
                  ringOpacity: "50",
                }}
              >
                {interval.charAt(0).toUpperCase() + interval.slice(1)} billing
              </Button>
            ))}
          </Flex>
        </Flex>
        <Flex mt={12} wrap="wrap" justify="center" gap={6}>
          {products.map((product) => {
            const price = product?.prices?.find(
              (p) => p.interval === billingInterval
            );
            if (!price) return null;
            const priceString = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: price.currency,
              minimumFractionDigits: 0,
            }).format((price?.unit_amount || 0) / 100);
            return (
              <Box
                key={product.id}
                flex="1"
                basis="1/3"
                maxW="xs"
                bg="zinc.900"
                rounded="lg"
                shadow="sm"
                p={6}
                borderWidth={
                  subscription &&
                  product.name === subscription?.prices?.products?.name
                    ? "1px"
                    : "0px"
                }
                borderColor="pink.500"
              >
                <Text fontSize="2xl" fontWeight="semibold" color="white">
                  {product.name}
                </Text>
                <Text mt={4} color="zinc.300">
                  {product.description}
                </Text>
                <Text
                  mt={8}
                  fontSize="5xl"
                  fontWeight="extrabold"
                  color="white"
                >
                  {priceString}
                </Text>
                <Text fontSize="base" color="zinc.100">
                  /{billingInterval}
                </Text>
                <Button
                  mt={8}
                  w="full"
                  bg="zinc.700"
                  color="white"
                  isLoading={priceIdLoading === price.id}
                  onClick={() => handleStripeCheckout(price)}
                >
                  {subscription ? "Manage" : "Subscribe"}
                </Button>
              </Box>
            );
          })}
        </Flex>
      </Box>
    );
  }
}
