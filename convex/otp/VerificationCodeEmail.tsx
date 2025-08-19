import {
  Container,
  Head,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export function VerificationCodeEmail({
  code,
  expires,
}: {
  code: string;
  expires: Date;
}) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Container className="container px-20 font-sans">
          <Heading className="text-xl font-bold mb-4">
            Welcome to Facebloat!
          </Heading>
          <Text className="text-sm">
            Your verification code is ready. Enter this code to continue signing in.
          </Text>
          <Section className="text-center">
            <Text className="font-semibold">Verification code</Text>
            <Text className="font-bold text-4xl">{code}</Text>
            <Text>
              (This code is valid for{" "}
              {Math.floor((+expires - Date.now()) / (60 * 1000))} minutes)
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
