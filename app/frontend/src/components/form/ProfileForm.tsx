import { useState } from "react";
import { schemaResolver, useForm } from "@mantine/form";
import {
  type PaperProps,
  Button,
  Paper,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { UpdateProfileSchema, type UpdateProfile } from "shared";
import { useAuth } from "../../hooks/useAuth";
import ErrorMessages from "../utils/ErrorMessages";
import { updateProfile } from "../../services/user.service";

type FieldConfig = {
  name: keyof UpdateProfile;
  label: string;
  component?: typeof TextInput | typeof Textarea;
};

const fields: FieldConfig[] = [
  { name: "name", label: "Name" },
  { name: "username", label: "Username" },
  { name: "email", label: "Email" },
  { name: "bio", label: "bio", component: Textarea },
];

export function ProfileSettings(props: PaperProps) {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string | string[] | string | null>(null);

  const form = useForm({
    mode: "controlled",
    initialValues: {
      username: user?.username ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      bio: user?.bio ?? "",
    },
    validate: schemaResolver(UpdateProfileSchema, { sync: true }),
  });

  const handleUpdate = form.onSubmit(async (data) => {
    setError(null);
    try {
      if (!user) return;
      const res = await updateProfile(user.id, data);
      notifications.show({ message: "Profile updated" });
      updateUser(res);
      form.setInitialValues(data);
      form.resetDirty(data);
    } catch (error: any) {
      setError(error?.message ?? "Something weird happened");
    }
  });

  return (
    <Paper p="xs" withBorder {...props}>
      <form onSubmit={handleUpdate}>
        <Stack>
          {fields.map(({ name, label, component: Field = TextInput }) => (
            <Field
              key={form.key(name)}
              label={label}
              {...form.getInputProps(name)}
            />
          ))}

          {error && <ErrorMessages error={error} />}

          <Button type="submit" disabled={!form.isDirty()}>
            Save
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
