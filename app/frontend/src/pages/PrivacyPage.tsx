import { Button, Container, List, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

const LAST_UPDATED = "November 19, 2026";
const CONTACT_EMAIL = "matthieu@gillieron.dev";

function PrivacyPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Button component={Link} to="/" variant="subtle" w="fit-content">
          ← Back
        </Button>

        <div>
          <Title order={1}>Privacy Policy</Title>
          <Text c="dimmed" size="sm">
            Last updated: {LAST_UPDATED}
          </Text>
        </div>

        <Text>
          This website is an online multiplayer strategy board game made by the
          ctrl+alt+transcend team as a student project (ft_transcendence, 42
          school). This page explains which personal data we collect, why we
          collect it and what rights you have over it.
        </Text>

        <section>
          <Title order={2} size="h3" mb="xs">
            1. Data we collect
          </Title>
          <List spacing="xs">
            <List.Item>
              <b>Account data:</b> your username, display name and email
              address, given when you sign up.
            </List.Item>
            <List.Item>
              <b>Password:</b> stored only as a secure hash. We never store or
              see your password in plain text.
            </List.Item>
            <List.Item>
              <b>Google sign-in:</b> if you log in with Google, we receive your
              Google account identifier, name, email address and the tokens
              needed for the connection.
            </List.Item>
            <List.Item>
              <b>Profile data:</b> your bio and avatar, if you choose to add
              them.
            </List.Item>
            <List.Item>
              <b>Game data:</b> for each finished game: date, number of turns,
              your rank, victory points, settlements and cities built, and
              whether you won.
            </List.Item>
            <List.Item>
              <b>Social data:</b> the messages you send in the chat, your
              friends list and your online status.
            </List.Item>
          </List>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            2. Why we use it
          </Title>
          <List spacing="xs">
            <List.Item>To create your account and log you in.</List.Item>
            <List.Item>To run the games you play.</List.Item>
            <List.Item>
              To compute your statistics, level, experience points,
              achievements, match history and the leaderboard.
            </List.Item>
            <List.Item>
              To provide the social features: chat, friends and online status.
            </List.Item>
          </List>
          <Text mt="xs">
            We do not use your data for advertising and we do not sell it.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            3. What other players can see
          </Title>
          <Text>
            Other players can see your username, avatar, level and position on
            the leaderboard, as well as the messages you send in the chat. Your
            friends can see your online status. Your email address and password
            are never shown to other players.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            4. Cookies and local storage
          </Title>
          <Text>
            We only use what is needed to keep you logged in: an authentication
            token stored in a cookie (valid for 24 hours) or in your
            browser&apos;s local storage. We do not use any tracking, analytics
            or advertising cookies. Logging out removes the token.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            5. Sharing
          </Title>
          <Text>
            Your data is stored in our own database and is not shared with third
            parties. The only external service involved is Google, and only if
            you choose to log in with your Google account; in that case
            Google&apos;s own privacy policy also applies.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            6. How long we keep it
          </Title>
          <Text>
            We keep your data as long as your account exists. When an account is
            deleted, all the data linked to it (profile, login data, game
            history and chat messages) is deleted with it.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            7. Your rights
          </Title>
          <Text>
            Under the General Data Protection Regulation (GDPR), you can ask to
            access, correct or delete your personal data, or ask for a copy of
            it. You can update your profile information at any time from your
            profile page. For any other request, including deleting your
            account, contact us at {CONTACT_EMAIL}.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            8. Security
          </Title>
          <Text>
            Passwords are hashed, and access to your data requires you to be
            logged in. As this is a student project, we cannot guarantee the
            same level of security as a commercial service, so please do not
            reuse a password you use elsewhere.
          </Text>
        </section>

        <section>
          <Title order={2} size="h3" mb="xs">
            9. Changes and contact
          </Title>
          <Text>
            We may update this policy when the project changes; the date at the
            top of this page shows the latest version. If you have any question,
            contact us at {CONTACT_EMAIL}.
          </Text>
        </section>
      </Stack>
    </Container>
  );
}

export default PrivacyPage;
