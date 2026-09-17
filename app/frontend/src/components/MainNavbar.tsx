import { Box, Image, Skeleton, Stack } from "@mantine/core";
import RegisterDrawer from "./buttons/RegisterDrawer";

export default function MainNavbar() {
  return (
    <Stack
      ml={10}
      mr={10}
      mt={20}
      mb={20}
      gap="md"
      align="center"
      justify="center" >
      <RegisterDrawer/>
      <Box>
        <Image
          src="https://pleated-jeans.com/wp-content/uploads/2025/02/funniest-dungeons-and-dragons-memes-1-1.webp"
          radius='xs'/>
      </Box>
      <Skeleton animate={true} height={250} />
    </Stack>
  );
}