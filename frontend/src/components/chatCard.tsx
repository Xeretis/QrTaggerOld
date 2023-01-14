import { Box, Button, Card, Group, Text, Title, createStyles } from "@mantine/core";

import { IndexChatMessagesResponse } from "../api/model";

const useStyles = createStyles((theme) => ({
    textContainer: {
        maxWidth: "75%",
    },
}));

export const ChatCard = ({
    messages,
    onSelect,
}: {
    messages: IndexChatMessagesResponse;
    onSelect: (messages: IndexChatMessagesResponse) => void | Promise<void>;
}): JSX.Element => {
    const { classes } = useStyles();

    return (
        <Card withBorder p="xs" radius="md">
            <Group position="apart">
                <Box className={classes.textContainer}>
                    <Title order={4} truncate>
                        From: {messages.userId}
                    </Title>
                    <Text color="dimmed" truncate>
                        {messages.messages[0].message}
                    </Text>
                </Box>
                <Button onClick={() => onSelect(messages)} radius="md">
                    View
                </Button>
            </Group>
        </Card>
    );
};
