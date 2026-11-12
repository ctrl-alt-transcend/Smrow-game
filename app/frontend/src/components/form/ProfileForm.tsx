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
  const [saving, setSaving] = useState(false);
  const form = useForm<Record<Field, string>>({ initialValues: toForm(user) });

  const saved = toForm(user);

  const changedFields = FIELDS.filter(
    (f) => form.values[f.name] !== saved[f.name],
  );
  const hasChanges = changedFields.length > 0;

  const handleSave = async () => {
    form.clearErrors();

    // on n'envoie que les champs modifiés
    const raw: Partial<Record<Field, string | null>> = {};
    for (const f of changedFields) {
      const value = form.values[f.name];
      raw[f.name] = f.nullable && value === "" ? null : value;
    }

    // validation de tous les champs modifiés d'un coup
    const result = UpdateProfileSchema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field | undefined;
        if (field && FIELDS.some((f) => f.name === field)) {
          // on garde le premier message d'erreur par champ
          if (!form.errors[field]) form.setFieldError(field, issue.message);
        }
      }
      return;
    }

    try {
      setSaving(true);
      await updateProfile(result.data);
      await refreshUser();
      form.resetDirty();
      notifications.show({ message: "Profile updated" });
    } catch (e) {
      if (e === 409) {
        // adapte si ton API indique quel champ est en conflit
        const conflict = changedFields.filter(
          (f) => f.name === "username" || f.name === "email",
        );
        if (conflict.length > 0) {
          for (const f of conflict) {
            form.setFieldError(f.name, `${f.label} already taken`);
          }
        } else {
          notifications.show({ color: "red", message: "Conflict detected" });
        }
      } else {
        notifications.show({
          color: "red",
          message: "Could not update profile",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSave();
      }}
    >
      <Stack>
        {FIELDS.map((f) => {
          const Input = f.multiline ? Textarea : TextInput;
          return (
            <Input
              key={f.name}
              label={f.label}
              {...form.getInputProps(f.name)}
            />
          );
        })}

        <Group justify="flex-end">
          <Button
            variant="default"
            disabled={!hasChanges || saving}
            onClick={() => {
              form.setValues(saved);
              form.clearErrors();
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={!hasChanges} loading={saving}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
