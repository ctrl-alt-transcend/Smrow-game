
import { Title, Paper, ScrollArea, Stack } from "@mantine/core";
import { messages } from "../../mocks/chat.mock";
import MessageItem from "./MessageItem";


export default function Chat(){

	return (

		<Paper withBorder p="md">
			<Title order={3} ta="center" mb="md">Toxic chat</Title>
			<ScrollArea h={507}>
				<Stack gap="xs" align="flex-start">
				{messages.map((message) => (
					<MessageItem key={message.id} message={message}/>
				))}
				</Stack>
			</ScrollArea>
		</Paper>
	)
}
