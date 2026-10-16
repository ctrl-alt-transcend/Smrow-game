import { Title, Box, BackgroundImage } from '@mantine/core'

interface TitleContent {
    content: string;
}

export default function MainTitle ({content}: TitleContent) {
    return (
        <Box
        bd={'solid 5px Gray'}
        ta='center'
        mt='lg'
        mb='lg'
        >
            <BackgroundImage
                src="https://i.pinimg.com/736x/33/79/04/337904946a53d032e04120f08bbb2fde.jpg"
            >
                <Title p={'sm'} c='Red' bd={'solid 5px LightGreen'}>{content}</Title>
            </BackgroundImage>
        </Box>
    );
}