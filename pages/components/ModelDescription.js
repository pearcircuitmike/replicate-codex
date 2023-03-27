// components/ModelDescription.js
import { Box, Heading, Link, Text } from "@chakra-ui/react";

export default function ModelDescription({
  model,
  rank,
  avgCompletionTimeMinutes,
}) {
  const avgCompletionTimeSeconds = Math.round(avgCompletionTimeMinutes * 60);

  return (
    <>
      {model && (
        <Box>
          <Heading as="h2" size="lg" my="8">
            Replicate Codex Description
          </Heading>
          <Text mb="4">
            Let me introduce you to an AI model called {model.modelName},
            crafted by {model.creator}. This model is a {model.tags}-type model,
            making it an excellent tool for people interested in this specific
            domain. Now, you might be wondering how popular this model is,
            right? Well, it currently holds the rank of #{rank}. The rank is the
            sum of all runs for a model, compared to the runs of all other
            models on our platform.
          </Text>
          <Text mb="4">
            As far as popularity goes, {model.modelName} has been run{" "}
            {model.runs.toLocaleString()} times. The number of times a model has
            been run speaks volumes about its widespread usage and the trust
            people place in it. Each time you use this model, it costs an
            average of ${model.costToRun}, based on the average runtime and
            hardware data we have. Your results may very and they depend on the
            input and type of hardware you use.
          </Text>
          <Text mb="4">
            Here is a quick overview of what {model.modelName} can do.{" "}
          </Text>
          <Text mb="4">
            The creator provided us with the following description:{" "}
            {model.description}.
          </Text>
          <Text mb="4">
            {model.predictionHardware
              ? ` This cost data was predicted using a ${model.predictionHardware}, a type of hardware that ensures it performs efficiently. `
              : " "}{" "}
            {avgCompletionTimeSeconds
              ? `And guess what? It takes just about ${avgCompletionTimeSeconds} seconds for a single run to complete, on average. Note that your results may very, depending on your inputs and hardware. `
              : ""}
          </Text>
          <Text mb="4">
            {model.githubUrl ? (
              <>
                Curious about how it all works? Check out the{" "}
                <Link
                  href={model.githubUrl}
                  textDecoration="underline"
                  color="teal"
                >
                  source code on GitHub
                </Link>
                .{" "}
              </>
            ) : (
              ""
            )}
            {model.paperUrl ? (
              <>
                If you want to dive deep into the research behind{" "}
                {model.modelName}, why not take a look at the{" "}
                <Link
                  href={model.paperUrl}
                  textDecoration="underline"
                  color="teal"
                >
                  research paper
                </Link>
                ?{" "}
              </>
            ) : (
              ""
            )}
            {model.licenseUrl ? (
              <>
                By the way, this model comes with a{" "}
                <Link
                  href={model.licenseUrl}
                  textDecoration="underline"
                  color="teal"
                >
                  license
                </Link>
                . Make sure you are aware of the terms!{" "}
              </>
            ) : (
              ""
            )}
          </Text>
          <Text mb="4">
            Are you excited to try {model.modelName}? Head over to Replicate and
            experience its capabilities firsthand!
          </Text>
        </Box>
      )}
    </>
  );
}
