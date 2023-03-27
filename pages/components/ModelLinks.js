import { HStack, Text, Link } from "@chakra-ui/react";

const ModelLinks = ({ model }) => {
  return (
    <HStack spacing={8}>
      <Text fontSize="lg">
        {model?.githubUrl ? (
          <Link href={model.githubUrl} textDecoration="underline" color="teal">
            View the source code on GitHub
          </Link>
        ) : (
          ""
        )}
      </Text>
      <Text fontSize="lg">
        {model?.paperUrl ? (
          <Link href={model.paperUrl} textDecoration="underline" color="teal">
            Read the research paper
          </Link>
        ) : (
          ""
        )}
      </Text>
      <Text fontSize="lg">
        {model?.licenseUrl ? (
          <Link href={model.licenseUrl} textDecoration="underline" color="teal">
            View the license
          </Link>
        ) : (
          ""
        )}
      </Text>
    </HStack>
  );
};

export default ModelLinks;
