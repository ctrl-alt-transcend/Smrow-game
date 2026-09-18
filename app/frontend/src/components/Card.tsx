import { Box, Card, Text, Image } from '@mantine/core';

export default function CardImage () {
    return (
        <Card padding="sm" withBorder orientation="horizontal">

            <Card.Section inheritPadding px='xs' withBorder>
                <Text>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Magnam voluptatum corporis minus sequi soluta est, odio delectus
                    voluptatibus? Praesentium eveniet doloremque est doloribus non consequuntur
                    quas, mollitia accusamus vitae voluptates!
                </Text>
            </Card.Section>

            <Card.Section inheritPadding px="md">
                <Image
                    src="https://plus.unsplash.com/premium_photo-1789200609644-cbcd8711dae2?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
            </Card.Section>

        </Card>
    );
}
