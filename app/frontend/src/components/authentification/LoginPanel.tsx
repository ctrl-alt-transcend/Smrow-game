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

import { schemaResolver, useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import ErrorMessages from "../utils/ErrorMessages";
import { RegisterPostSchema, LoginPostSchema } from "shared";

export function LoginPanel(props: PaperProps) {
  const { register, login } = useAuth();
  const [type, toggle] = useToggle(["register", "login"]);
  const [error, setError] = useState<string | string[] | null>(null);

  const registerForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      name: "",
      email: "",
      password: "",
    },
    validate: schemaResolver(RegisterPostSchema, { sync: true }),
  });

  const loginForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: schemaResolver(LoginPostSchema, { sync: true }),
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
              label="Name"
              placeholder="Your name"
              key={registerForm.key("name")}
              {...registerForm.getInputProps("name")}
              error={registerForm.errors.name}
            />
            <TextInput
              label="Username"
              placeholder="Your username"
              key={registerForm.key("username")}
              {...registerForm.getInputProps("username")}
              error={registerForm.errors.username}
            />
            <TextInput
              required
              label="Email"
              placeholder="Your email"
              key={registerForm.key("email")}
              {...registerForm.getInputProps("email")}
              error={registerForm.errors.email}
            />
            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              key={registerForm.key("password")}
              {...registerForm.getInputProps("password")}
              error={registerForm.errors.password}
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
              label="Email"
              placeholder="Your email"
              key={loginForm.key("email")}
              {...loginForm.getInputProps("email")}
              error={loginForm.errors.email}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              key={loginForm.key("password")}
              {...loginForm.getInputProps("password")}
              error={loginForm.errors.password}
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Button type="submit">{upperFirst(type)}</Button>
          </Group>
        </form>
      )}

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
