import { useState } from "react";
import { Button, FileInput, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { UploadImageSchema } from "shared";
import { useAuth } from "../../hooks/useAuth";
import { uploadAvatar } from "../../services/user.service";

export function ProfilePictureUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (selected: File | null) => {
    setError(null);
    if (selected) {
      const result = UploadImageSchema.safeParse(selected);
      if (!result.success) {
        setError(result.error.issues[0].message);
        setFile(null);
        return;
      }
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file || !user) return;
    console.log("front has file");
    setLoading(true);
    setError(null);
    try {
      await uploadAvatar(user.id, file);
      //   setUser(updated);
      setFile(null);
      notifications.show({ message: "Photo de profil mise à jour" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <FileInput
        accept="image/png,image/jpeg,image/gif"
        label="Change your profile picture"
        description="png, gif, jpeg (5 Mo max)"
        placeholder="Your image"
        clearable
        value={file}
        onChange={handleChange}
        error={error}
      />
      <Button
        onClick={handleSubmit}
        disabled={!file || !user}
        loading={loading}
      >
        Send
      </Button>
    </Stack>
  );
}
