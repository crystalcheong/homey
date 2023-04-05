import { Text } from "@mantine/core";
import dynamic from "next/dynamic";
const TermsAndPrivacyLinks = dynamic(() => import("./TermsAndPrivacyLinks"));

const TermsDisclaimer = () => {
  return (
    <Text
      component="p"
      color="dimmed"
      size="xs"
    >
      You agree to Homey's <TermsAndPrivacyLinks />. &nbsp; By choosing to
      contact a property, you also agree that Homey, landlords, and property
      managers may call or text you about any inquiries you submit through our
      services, which may involve use of automated means and
      prerecorded/artificial voices. You don't need to consent as a condition of
      renting any property, or buying any other goods or services. Message/data
      rates may apply.
    </Text>
  );
};

export default TermsDisclaimer;
