import {
    Button,
    Checkbox,
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

import { postData } from './handlePost'

export function LoginPanel(props: PaperProps) {

    const [type, toggle] = useToggle(['register', 'login']);
    const form = useForm({
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

    return (
        <Paper p="xs" withBorder
        {...props}>
            <Text p="xs" size="lg" fw="500" c="Red">
                Login to play !
            </Text>

            <form onSubmit={form.onSubmit(postData)}>
                <Stack>
                    {type === 'register' && (
                        <TextInput
                        placeholder="Your name"
                        value={form.values.name}
                        onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                        />
                    )}

                    {type === 'register' && (
                        <TextInput
                        placeholder='Your username'
                        value={form.values.username}
                        onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
                        />
                    )}
                    
                    <TextInput
                        required
                        placeholder="Your email"
                        value={form.values.email.toLowerCase()}
                        onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                        error={form.errors.email && 'Invalid email'}
                    />

                    <PasswordInput
                        required
                        placeholder="Your password"
                        value={form.values.password}
                        onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                        error={form.errors.password && 'Password should include at least 6 characters'}
                    />

                    {/* {type === 'register' && (
                        <Checkbox
                            label="I accept terms and conditions"
                            checked={form.values.terms}
                            onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
                        />
                    )} */}
                </Stack>

                <Group justify="space-between" mt="xl">
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
                        <Button type="submit">
                            {upperFirst(type)}
                        </Button>
                </Group>
            </form>

            { /* Error handleing */ }
            <form
                onSubmit={form.onSubmit(
                    (values, event) => {
                        console.log(
                            values,
                            event
                        );
                    },
                    (validationErros, values, event) => {
                        console.log(
                            validationErros,
                            values,
                            event
                        );
                    }
                )}
            />

            <form onReset={form.onReset}></form>
        </Paper>
    )
}
