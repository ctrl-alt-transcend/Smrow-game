import {
  Anchor,
  Button,
  Container,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "react-router";

const LAST_UPDATED = "November 19, 2026";
const CONTACT_EMAIL = "matthieu@gillieron.dev";

function TermsPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Button component={Link} to="/" variant="subtle" w="fit-content">
          ← Back
        </Button>

        <div>
          <Title order={1}>Terms of Service</Title>
          <Text c="dimmed" size="sm">
            Last updated: {LAST_UPDATED}
          </Text>
        </div>

        <Text>
          These terms govern your use of this website, an online multiplayer
          strategy board game made by the ctrl+alt+transcend team as a student
          project (ft_transcendence, 42 school). By creating an account or using
          the website, you accept these terms.
        </Text>

        <section>
          <Title order={2} size="h3" mb="xs">
            1. The service
          </Title>
          <Text>
            The website lets you create an account, play online games against
            other players, follow your statistics, achievements and ranking,
            chat and add friends. It is a free, non-commercial educational
            project.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            2. Your account
          </Title>
          <List spacing="xs">
            <List.Item>
              You must give accurate information when you sign up.
            </List.Item>
            <List.Item>
              You are responsible for keeping your password secret and for
              everything done with your account.
            </List.Item>
            <List.Item>
              One person, one account: accounts are personal.
            </List.Item>
          </List>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            3. Rules of conduct
          </Title>
          <Text mb="xs">When using the website, you agree not to:</Text>
          <List spacing="xs">
            <List.Item>
              Cheat, exploit bugs or use automated tools to gain an advantage or
              manipulate statistics and the leaderboard.
            </List.Item>
            <List.Item>
              Post insulting, hateful, harassing or illegal content, in the chat
              or in your username, bio or avatar.
            </List.Item>
            <List.Item>Impersonate another player or person.</List.Item>
            <List.Item>
              Try to access other accounts or data, or to disrupt the website.
            </List.Item>
          </List>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            4. Suspension
          </Title>
          <Text>
            We may remove content, reset statistics, or suspend or delete an
            account that breaks these rules, without prior notice.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            5. Your data
          </Title>
          <Text>
            How we collect and use your personal data is explained in our{" "}
            <Anchor component={Link} to="/privacy">
              Privacy Policy
            </Anchor>
            .
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            6. Availability and liability
          </Title>
          <Text>
            The website is provided &quot;as is&quot;, without any guarantee. As
            a student project, it may be unavailable, contain bugs, or be
            changed or shut down at any time, and game data or statistics may be
            reset. We are not liable for any loss resulting from its use.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            7. Intellectual property
          </Title>
          <Text>
            The source code of the project is released under the MIT License.
            You keep the rights to the content you post, but you allow us to
            display it on the website so other players can see it.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            8. Ending your use
          </Title>
          <Text>
            You can stop using the website at any time and ask for your account
            to be deleted by contacting us at {CONTACT_EMAIL}.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            9. Changes and contact
          </Title>
          <Text>
            We may update these terms when the project changes; the date at the
            top of this page shows the latest version. If you have any question,
            contact us at {CONTACT_EMAIL}.
          </Text>
        </section>
      </Stack>
    </Container>
  );
}

export default TermsPage;
