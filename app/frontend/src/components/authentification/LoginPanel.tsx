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
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useState } from 'react';

import { useAuth } from '../../hooks/useAuth';

export function LoginPanel(props: PaperProps) {

    const { register, login, user, logout, loading } = useAuth();
    const [type, toggle] = useToggle(['register', 'login']);
    const [error, setError] = useState<string | null>(null);

    const registerForm = useForm({
        initialValues: {
            email: '',
            name: '',
            username: '',
            password: '',
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const loginForm = useForm({
        initialValues: {
            email: '',
            password: '',
        },
    });

    const handleRegister = registerForm.onSubmit(async (data) => {
        setError(null);
        try {
            await register(data);
        } catch (errorMessage: any) {
            setError(errorMessage);
        }
    });

    const handleLogin = loginForm.onSubmit(async (data) => {
        setError(null);
        try {
            await login(data);
        } catch {
            setError("Invalid credentials");
        }
    });

    // Logged state
    if (loading) {
        return (
            <Paper p="xs" withBorder {...props}>
                <Text p="xs" c="dimmed">Loading...</Text>
            </Paper>
        )
    }

    if (user) {
        return (
            <Paper p="xs" withBorder {...props}>
                <Text p="xs" size="lg" fw="500" c="Red">
                    Welcome, {user.name} !
                </Text>

                <Stack gap="xs" p="xs">
                    <Text size="sm">
                        <b>Name:</b> {user.name}
                    </Text>
                    <Text size="sm">
                        <b>Email:</b> {user.email}
                    </Text>
                    <Text size="sm" c="dimmed">
                        <b>ID:</b> {user.id}
                    </Text>
                </Stack>

                <Group justify="space-between" mt="xl" p="xs">
                    <Button variant="light" color="red" onClick={logout}>
                        Logout
                    </Button>
                </Group>
            </Paper>
        );
    }

    
    return (
        <Paper p="xs" withBorder {...props}>
            <Text p="xs" size="lg" fw="500" c="Red">
                Login to play !
            </Text>

            {type === 'register' && (
                <form onSubmit={handleRegister}>
                    <Stack>
                        <TextInput
                            placeholder="Your name"
                            value={registerForm.values.name}
                            onChange={(event) => registerForm.setFieldValue('name', event.currentTarget.value)}
                        />
                        <TextInput
                            placeholder='Your username'
                            value={registerForm.values.username}
                            onChange={(event) => registerForm.setFieldValue('username', event.currentTarget.value)}
                        />
                        <TextInput
                            required
                            placeholder="Your email"
                            value={registerForm.values.email}
                            onChange={(event) => registerForm.setFieldValue('email', event.currentTarget.value)}
                            error={registerForm.errors.email && 'Invalid email'}
                        />
                        <PasswordInput
                            required
                            placeholder="Your password"
                            value={registerForm.values.password}
                            onChange={(event) => registerForm.setFieldValue('password', event.currentTarget.value)}
                            error={registerForm.errors.password && 'Password should include at least 6 characters'}
                        />
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Button type="submit">{upperFirst(type)}</Button>
                    </Group>
                </form>
            )}

            {type === 'login' && (
                <form onSubmit={handleLogin}>
                    <Stack>
                        <TextInput
                            required
                            placeholder="Your email"
                            value={loginForm.values.email}
                            onChange={(event) => loginForm.setFieldValue('email', event.currentTarget.value)}
                            error={loginForm.errors.email && 'Invalid email'}
                        />
                        <PasswordInput
                            required
                            placeholder="Your password"
                            value={loginForm.values.password}
                            onChange={(event) => loginForm.setFieldValue('password', event.currentTarget.value)}
                        />
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Button type="submit">{upperFirst(type)}</Button>
                    </Group>
                </form>
            )}

            {error && (
                <Text c="red" size="sm" mt="xs">
                    {error}
                </Text>
            )}

            <Anchor
                component="button"
                type="button"
                c="bright"
                opacity={0.85}
                onClick={() => toggle()}
                size="xs"
            >
                {type === 'register'
                    ? 'Already have an account? Login'
                    : "Don't have an account? Register"}
            </Anchor>
        </Paper>
    );
}