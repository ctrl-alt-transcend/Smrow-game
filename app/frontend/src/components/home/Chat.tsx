import { useState } from "react";
import { useAuth } from '../../hooks/useAuth'
import { Title, Paper, ScrollArea, Stack, Group, TextInput, Button } from "@mantine/core";
import { messages as initialMessages } from "../../mocks/chat.mock";
import MessageItem from "./MessageItem";

export default function Chat(){

    const { user } = useAuth();
	const [draft, setDraft] = useState('');
	const [messages, setMessages] = useState(initialMessages);

	function handleSend() {
		if (draft.trim() === '')
			return;

		const newMessage = {
			id: Date.now().toString(),
			author: user?.name,
			content: draft,
		};

		setMessages([...messages, newMessage]);
		setDraft('');
	}

	return (

		<Paper  withBorder p="md" h="100%" >
			<Title order={3} ta="center" mb="md">Toxic chat</Title>
			<ScrollArea h={480}>
				<Stack gap="xs" align="flex-start">
				{messages.map((message) => (
					<MessageItem key={message.id} message={message}/>
				))}
				</Stack>
			</ScrollArea>
			<Group gap="xs" mt="md">
				<TextInput
					flex={1}
					placeholder="Say something toxic..."
					value={draft}
					onChange={(event) => setDraft(event.currentTarget.value)}
				/>
				<Button onClick={handleSend}>send</Button>
			</Group>
		</Paper>
	)
}
