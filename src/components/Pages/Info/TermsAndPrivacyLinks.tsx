import { Text } from "@mantine/core";
import Link from "next/link";

const TermsAndPrivacyLinks = () => {
  return (
    <>
      &nbsp;
      <Text
        component={Link}
        href="/info/terms"
        variant="gradient"
      >
        Terms and Conditions
      </Text>
      &nbsp;&amp;&nbsp;
      <Text
        component={Link}
        href="/info/privacy"
        variant="gradient"
      >
        Privacy Policy
      </Text>
    </>
  );
};

export default TermsAndPrivacyLinks;
