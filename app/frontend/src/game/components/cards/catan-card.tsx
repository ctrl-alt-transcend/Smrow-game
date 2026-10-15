import { Card, Image, Text, Badge, Box  } from '@mantine/core'
import { useState } from 'react';

interface cardProps {
	name: string;
	imageUrl: string;
	count: number;
	color: string;
}

export function CardModel({name, imageUrl, count, color }: cardProps) {
	//const [flipped, setFlipped] = useState(false);
	return (
		//<Box
		//	onClick={() ==> setFlipped(!flipped)}
		//	style={{
		//		width: 180,
		//		height: 240,
		//		perspective: '1000px',
		//		cursor: 'pointer',
		//	}}
		//>
		<Card shadow="md" padding="md" radius="lg" withBorder w={180} h={240}
				style={{width: '100%', margin: '0 auto ', position:'relative', overflow: 'hidden', display: 'flex-start', flexDirection: 'column', flexShrink: 0}}
		>
			<Card.Section>
				<Box bg={`${color}.1`} p="xs" style={{ textAlign: 'center' }}>
					<Text fw={700} size="lg" c={`${color}.9`} style={{ letterSpacing: '1px' }}>
						{name.toUpperCase()}
					</Text>
				</Box>
				<Image
					src={imageUrl}
					height={130}
					alt={name}
					fit="cover"
				/>
			</Card.Section>
				<Box
					style={{
					position: 'absolute',
					bottom: '12px', // vertical position 'bottom' && 'top'
					left: '10px', // circle position 'left' or 'right'
					zIndex: 10
					}}
					>
				<Badge
					size="xl"
					circle
					color={count > 0 ? color : 'gray'}
					variant={count > 0 ? 'filled' : 'outline'}
					style={{
						boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
						fontSize: '1rem',
						width: '36px',
						height: '36px'
					}}
					>
					{count}
				</Badge>
				</Box>
		</Card>
		//</Box>
	);
}
