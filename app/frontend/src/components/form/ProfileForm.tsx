import { useState } from "react";
import { useForm } from "@mantine/form";
import { Button, Group, Stack, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { UpdateProfileSchema, type UserProfile } from "shared";
import { useAuth } from "../../hooks/useAuth"; // adapte le chemin
import { updateProfile } from "../../services/user.service";

type Field = "name" | "username" | "email" | "bio" | "avatarURL";

type FieldConfig = {
  name: Field;
  label: string;
  multiline?: boolean;
  nullable?: boolean;
};

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name" },
  { name: "username", label: "Username" },
  { name: "email", label: "Email" },
  { name: "bio", label: "Bio", multiline: true, nullable: true },
  { name: "avatarURL", label: "Avatar URL", nullable: true },
];

const toForm = (u: UserProfile): Record<Field, string> => ({
  name: u.name,
  username: u.username,
  email: u.email,
  bio: u.bio ?? "",
  avatarURL: u.avatarURL ?? "",
});

export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  if (!user) return null;

  return (
    <ProfileFormInner key={user.id} user={user} refreshUser={refreshUser} />
  );
}

type InnerProps = {
  user: UserProfile;
  refreshUser: () => Promise<void>;
};

function ProfileFormInner({ user, refreshUser }: InnerProps) {
  const [saving, setSaving] = useState<Field | null>(null);
  const form = useForm<Record<Field, string>>({ initialValues: toForm(user) });

  // valeurs actuellement sauvegardées (source de vérité : le user du contexte)
  const saved = toForm(user);

  const saveField = async (f: FieldConfig) => {
    const value = form.values[f.name];
    const raw = f.nullable && value === "" ? null : value;

    // validation du seul champ modifié, le résultat est déjà bien typé
    const result = UpdateProfileSchema.safeParse({ [f.name]: raw });
    if (!result.success) {
      form.setFieldError(f.name, result.error.issues[0].message);
      return;
    }

    try {
      setSaving(f.name);
      await updateProfile(result.data);
      await refreshUser();
      notifications.show({ message: `${f.label} updated` });
    } catch (e) {
      if (e === 409) {
        form.setFieldError(f.name, `${f.label} already taken`);
      } else {
        notifications.show({
          color: "red",
          message: `Could not update ${f.label}`,
        });
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <Stack>
      {FIELDS.map((f) => {
        const Input = f.multiline ? Textarea : TextInput;
        return (
          <Group key={f.name} align="flex-end">
            <Input
              label={f.label}
              style={{ flex: 1 }}
              {...form.getInputProps(f.name)}
            />
            <Button
              disabled={form.values[f.name] === saved[f.name]}
              loading={saving === f.name}
              onClick={() => saveField(f)}
            >
              Save
            </Button>
          </Group>
        );
      })}
    </Stack>
  );
}
