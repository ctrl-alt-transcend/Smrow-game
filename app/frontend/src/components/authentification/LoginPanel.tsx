import {
  Button,
  Anchor,
  Group,
  Paper,
  Stack,
  PasswordInput,
  Text,
  TextInput,
  type PaperProps,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import ErrorMessages from "../utils/ErrorMessages";

export function LoginPanel(props: PaperProps) {
  const { register, login } = useAuth();
  const [type, toggle] = useToggle(["register", "login"]);
  const [error, setError] = useState<string | string[] | null>(null);

  const registerForm = useForm({
    initialValues: {
      email: "",
      name: "",
      username: "",
      password: "",
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const loginForm = useForm({
    initialValues: {
      email: "",
      password: "",
    },
  });

  const handleRegister = registerForm.onSubmit(async (data) => {
    setError(null);
    try {
      await register(data);
    } catch (error: any) {
      setError(error);
    }
  });

  const handleLogin = loginForm.onSubmit(async (data) => {
    setError(null);
    try {
      await login(data);
    } catch (errorMessage: any) {
      setError(errorMessage);
    }
  });

  return (
    <Paper p="xs" withBorder {...props}>
      <Text p="xs" size="lg" fw="500" c="Red">
        Login to play !
      </Text>

      {type === "register" && (
        <form onSubmit={handleRegister}>
          <Stack>
            <TextInput
              placeholder="Your name"
              value={registerForm.values.name}
              onChange={(event) =>
                registerForm.setFieldValue("name", event.currentTarget.value)
              }
            />
            <TextInput
              placeholder="Your username"
              value={registerForm.values.username}
              onChange={(event) =>
                registerForm.setFieldValue(
                  "username",
                  event.currentTarget.value,
                )
              }
            />
            <TextInput
              required
              placeholder="Your email"
              value={registerForm.values.email}
              onChange={(event) =>
                registerForm.setFieldValue("email", event.currentTarget.value)
              }
              error={registerForm.errors.email && "Invalid email"}
            />
            <PasswordInput
              required
              placeholder="Your password"
              value={registerForm.values.password}
              onChange={(event) =>
                registerForm.setFieldValue(
                  "password",
                  event.currentTarget.value,
                )
              }
              error={
                registerForm.errors.password &&
                "Password should include at least 6 characters"
              }
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Button type="submit">{upperFirst(type)}</Button>
          </Group>
        </form>
      )}

      {type === "login" && (
        <form onSubmit={handleLogin}>
          <Stack>
            <TextInput
              required
              placeholder="Your email"
              value={loginForm.values.email}
              onChange={(event) =>
                loginForm.setFieldValue("email", event.currentTarget.value)
              }
              error={loginForm.errors.email && "Invalid email"}
            />
            <PasswordInput
              required
              placeholder="Your password"
              value={loginForm.values.password}
              onChange={(event) =>
                loginForm.setFieldValue("password", event.currentTarget.value)
              }
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Button type="submit">{upperFirst(type)}</Button>
          </Group>
        </form>
      )}

      {/* {error && (
                <Text c="red" size="sm" mt="xs">
                    {error}
                </Text>
            )} */}

      <ErrorMessages error={error} />

      <Anchor
        component="button"
        type="button"
        c="bright"
        opacity={0.85}
        onClick={() => toggle()}
        size="xs"
      >
        {type === "register"
          ? "Already have an account? Login"
          : "Don't have an account? Register"}
      </Anchor>
    </Paper>
  );
}
