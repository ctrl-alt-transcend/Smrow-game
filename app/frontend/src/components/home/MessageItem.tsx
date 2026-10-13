
import type { ChatMessage } from '../../mocks/chat.mock'
import { Paper, Text } from "@mantine/core";


type MessageItemProps = {
	message: ChatMessage;
};

export default function MessageItem({message} : MessageItemProps) {

	return (
		<Paper bg="Red.1" p="xs" maw="95%"  style={{ overflowWrap: 'anywhere' }}>
			<Text fw={700}>@{message.author}</Text>
			<Text>{message.content}</Text>
		</Paper>
	)
}