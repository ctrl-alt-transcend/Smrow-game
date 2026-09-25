import { Group, Text } from "@mantine/core";
import { Link } from "react-router"
import { navLinks } from "./navLinks";

export default function Navbar(){

	return (
		<Group h="100%" px="md" justify="space-between">
			<Text>Transcendance</Text>
			<Group>
				{navLinks.map((link) => (
					<Link key={link.to} to={link.to}>
						{link.label}
					</Link>
				))}
			</Group>

			<Text>Nom_profile</Text>
		</Group>
	);
}