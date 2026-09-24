import { Group, Text } from "@mantine/core";
import { Link } from "react-router"



export default function Navbar(){

	return (
		<Group h="100%" px="md" justify="space-between">
			<Text>Transcendance</Text>
			<Group>
				<Link to="/home">Home</Link>
				<Link to="/profile">Profile</Link>
				<Link to="/stats">Stats</Link>
			</Group>

			<Text>Nom_profile</Text>
		</Group>
	);
}