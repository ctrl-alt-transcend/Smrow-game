import { Paper, Button, Group, TextInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { UsernameSchema } from "shared";
import { addFriend } from "../../services/social.service";
import { isAxiosError } from "axios";

export function AddFriend() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
    },
    validate: {
      username: (value) => {
        const result = UsernameSchema.safeParse(value);
        return result.success ? null : result.error.issues[0].message;
      },
    },
  });

  const handleFriendRequest = form.onSubmit(async (data) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);
      await addFriend(data.username);
      setSubmitSuccess("Friend request sent !");
      form.reset();
    } catch (e) {
      if (isAxiosError(e)) {
        switch (e.status) {
          case 404:
            setSubmitError("Can't find user.");
            return;
          case 409:
            setSubmitError("A request already exist with this user");
            return;
          case null:
            setSubmitError("Connection error");
        }
      }
      setSubmitError("Could not send the friend request, try again later.");
    }
  });

  return (
    <Paper withBorder p="md">
      <form onSubmit={handleFriendRequest}>
        <Group align="flex-end">
          <TextInput
            withAsterisk
            label="Username"
            placeholder="username"
            key={form.key("username")}
            {...form.getInputProps("username")}
          />
          <Button type="submit">Add</Button>
        </Group>
        {submitError && (
          <Text c="red" fz="sm" mt="xs">
            {submitError}
          </Text>
        )}
        {submitSuccess && (
          <Text c="green" fz="sm" mt="xs">
            {submitSuccess}
          </Text>
        )}
      </form>
    </Paper>
  );
}
