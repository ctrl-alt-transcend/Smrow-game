import { Title } from "@mantine/core";
import { FriendList } from "../components/social/FriendList";

function ProfilePage() {
  return (
    <>
      <Title c={"Red"}>Profile page</Title>
      <FriendList />
    </>
  );
}

export default ProfilePage;
