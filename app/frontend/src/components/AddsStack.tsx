import { Image, Stack, Skeleton, Box} from "@mantine/core";

export default function AddsStack() {
  return (
    <Stack
      ml={5}
      mr={5}
      mt={5}
      mb={5}
      gap="xs"
      align="center"
      justify="center" >
      <Box>
        <Image
          src="https://cdn.ebaumsworld.com/mediaFiles/picture/604025/87327860.jpg"
          radius='xs'/>
      </Box>
      <Box>
        <Image
          src="https://www.classification.gov.au/sites/default/files/styles/poster_tablet_2x/public/posters/xOLfkDK62MDxuhHLDqo8SOwIwG.jpg?itok=PUykR3i0"
          radius='xs'/>
      </Box>
      <Box>
        <Image
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.mos.cms.futurecdn.net%2FUx3stny4h2mMyJ7aw9WMcV-1200-80.jpg&f=1&nofb=1&ipt=0ecf280268c2be80cdc6b3073708367ada0da9c54a69d0b1145cc75f65833e90"
          radius='xs'/>
      </Box>
      <Skeleton animate={true} height={100} />
      <Skeleton animate={true} height={100} />
      <Box>
        <Image
          src="https://cdn.ebaumsworld.com/mediaFiles/picture/604025/87327859.jpg"
          radius='xs'/>
      </Box>
      <Skeleton animate={true} height={100} />
      <Box>
        <Image
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe3.365dm.com%2F23%2F12%2F768x432%2Fskynews-ai-fake-donald-trump_6390696.jpg%3F20231213064536&f=1&nofb=1&ipt=c1baf55e9842e96995749e3bbfd57be2f8e1ed44a603ef7d2fa9e717483096cf"
          radius='xs'/>
      </Box>
      <Box>
        <Image
          src="https://cdn.ebaumsworld.com/mediaFiles/picture/604025/87327855.jpg"
          radius='xs'/>
      </Box>
      <Skeleton animate={true} height={100} />
      <Skeleton animate={true} height={100} />
    </Stack>
  );
}