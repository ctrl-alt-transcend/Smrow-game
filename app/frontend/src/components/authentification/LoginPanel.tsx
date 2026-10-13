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

import { createUser, loginPost } from './handlePost'

export function LoginPanel(props: PaperProps) {

    const [type, toggle] = useToggle(['register', 'login']);

    const registerForm = useForm({
        initialValues: {
            email: '',
            name: '',
            username: '',
            password: '',
            // terms: false,
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
            // terms: (val) => (val === true ? null : 'You need to accept the terms and conditions'),
        },
    });

    const loginForm = useForm({
        initialValues: {
            email: '',
            password: '',
        }
    })

    return (
        <Paper p="xs" withBorder
        {...props}>
            <Text p="xs" size="lg" fw="500" c="Red">
                Login to play !
            </Text>

            <form onSubmit={registerForm.onSubmit(createUser)}>
                <Stack>
                    {type === 'register' && (
                        <TextInput
                        placeholder="Your name"
                        value={registerForm.values.name}
                        onChange={(event) => registerForm.setFieldValue('name', event.currentTarget.value)}
                    />
                    )}

                    {type === 'register' && (
                        <TextInput
                        placeholder='Your username'
                        value={registerForm.values.username}
                        onChange={(event) => registerForm.setFieldValue('username', event.currentTarget.value)}
                    />
                    )}

                    {type === 'register' && (
                        <TextInput
                        required
                        placeholder="Your email"
                        value={registerForm.values.email.toLowerCase()}
                        onChange={(event) => registerForm.setFieldValue('email', event.currentTarget.value)}
                        error={registerForm.errors.email && 'Invalid email'}
                    />
                    )}

                    {type === 'register' && (
                        <PasswordInput
                        required
                        placeholder="Your password"
                        value={registerForm.values.password}
                        onChange={(event) => registerForm.setFieldValue('password', event.currentTarget.value)}
                        error={registerForm.errors.password && 'Password should include at least 6 characters'}
                    />
                    )}

                    {/* {type === 'register' && (
                        <Checkbox
                            label="I accept terms and conditions"
                            checked={registerForm.values.terms}
                            onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
                        />
                    )} */}
                </Stack>

                {type === 'register' && (
                    <Group justify="space-between" mt="xl">
                    <Button type="submit">
                        {upperFirst(type)}
                    </Button>
                </Group>
                )}

            </form>

            <form onSubmit={loginForm.onSubmit(loginPost)}>
                {type === 'login' && (
                    <TextInput
                        required
                        placeholder="Your email"
                        value={loginForm.values.email.toLowerCase()}
                        onChange={(event) => loginForm.setFieldValue('email', event.currentTarget.value)}
                        error={loginForm.errors.email && 'Invalid email'}
                    />
                )}

                {type === 'login' && (
                    <PasswordInput
                        required
                        placeholder="Your password"
                        value={loginForm.values.password}
                        onChange={(event) => loginForm.setFieldValue('password', event.currentTarget.value)}
                        error={loginForm.errors.password && 'Password should include at least 6 characters'}
                    />
                )}

                { type === 'login' && (
                    <Group justify="space-between" mt="xl">
                    <Button type="submit">
                        {upperFirst(type)}
                    </Button>
                </Group>
                )}
            </form>

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

            <form onReset={registerForm.onReset}></form>
        </Paper>
    )
}
