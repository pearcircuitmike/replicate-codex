import React from "react";
import {
  Container,
  Heading,
  Text,
  Box,
  List,
  ListItem,
} from "@chakra-ui/react";

const TermsOfService = () => {
  return (
    <Container maxW="4xl" py={5}>
      <Heading as="h1" size="xl" mb={4}>
        Terms of Service
      </Heading>
      <Box mb={5}>
        <Text mb={2}>
          By accessing the website at http://aimodels.fyi, you are agreeing to
          be bound by these terms of service, all applicable laws and
          regulations, and agree that you are responsible for compliance with
          any applicable local laws. If you do not agree with any of these
          terms, you are prohibited from using or accessing this site. The
          materials contained in this website are protected by applicable
          copyright and trade law.
        </Text>

        <Heading as="h2" size="md" mt={4} mb={2}>
          Disclaimer
        </Heading>
        <Text>
          The materials on our website are provided on an as is basis.
          AIModels.fyi makes no warranties, expressed or implied, and hereby
          disclaims and negates all other warranties including, without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual
          property or other violation of rights. Further, AIModels.fyi does not
          warrant or make any representations concerning the accuracy, likely
          results, or reliability of the use of the materials on its website or
          otherwise relating to such materials or on any sites linked to this
          site.
        </Text>

        <Heading as="h2" size="md" mt={4} mb={2}>
          Limitations
        </Heading>
        <Text mb={2}>
          In no event shall AIModels.fyi or its suppliers be liable for any
          damages (including, without limitation, damages for loss of data or
          profit, or due to business interruption) arising out of the use or
          inability to use the materials on our website, even if AIModels.fyi or
          a AIModels.fyi authorized representative has been notified orally or
          in writing of the possibility of such damage.
        </Text>
        <Heading as="h2" size="md" mt={4} mb={2}>
          Accuracy of Materials
        </Heading>
        <Text mb={2}>
          The materials appearing on our website could include technical,
          typographical, or photographic errors. AIModels.fyi does not warrant
          that any of the materials on its website are accurate, complete or
          current. AIModels.fyi may make changes to the materials contained on
          its website at any time without notice. However, AIModels.fyi does not
          make any commitment to update the materials.
        </Text>
        <Heading as="h2" size="md" mt={4} mb={2}>
          Links
        </Heading>
        <Text mb={2}>
          AIModels.fyi has not reviewed all of the sites linked to its website
          and is not responsible for the contents of any such linked site. The
          inclusion of any link does not imply endorsement by AIModels.fyi of
          the site. Use of any such linked website is at your own risk.
        </Text>
        <Heading as="h2" size="md" mt={4} mb={2}>
          Modifications
        </Heading>
        <Text mb={2}>
          AIModels.fyi may revise these terms of service for its website at any
          time without notice. By using this website you are agreeing to be
          bound by the then current version of these terms of service.
        </Text>
        <Heading as="h2" size="md" mt={4} mb={2}>
          Governing Law
        </Heading>
        <Text>
          These terms and conditions are governed by and construed in accordance
          with the laws of the United States and you irrevocably submit to the
          exclusive jurisdiction of the courts in that location.
        </Text>
      </Box>
    </Container>
  );
};

export default TermsOfService;
