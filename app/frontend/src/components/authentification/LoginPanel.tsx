import {
    Button,
    Checkbox,
    Divider,
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

export function LoginPanel(props: PaperProps) {
    const [type, toggle] = useToggle(['login', 'register']);
    const form = useForm({
        initialValues: {
            email: '',
            name: '',
            password: '',
            terms: true,
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    return (
        <Paper p="md" {...props}>
            <Text p="xs" size="lg" fw="500" c="Red">
                Login to play !
            </Text>

            <form onSubmit={form.onSubmit(() => {})}>
                <Stack>
                    {type === 'register' && (
                        <TextInput
                        placeholder="Your name"
                        value={form.values.name}
                        onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                        />
                    )}
                    
                    <TextInput
                        required
                        placeholder="Your email"
                        value={form.values.email}
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

                    {type === 'register' && (
                        <Checkbox
                            label="I accept terms and conditions"
                            checked={form.values.terms}
                            onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
                        />
                    )}
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
        </Paper>
    )
}