import { Box, Button, Card, Group, Text, Title, createStyles } from "@mantine/core";

import { IndexItemTagsResponse } from "../api/model";
import { Link } from "react-router-dom";

const useStyles = createStyles((theme) => ({
    textContainer: {
        maxWidth: "75%",
    },
}));

export const ItemTagCard = ({ itemTag }: { itemTag: IndexItemTagsResponse }): JSX.Element => {
    const { classes } = useStyles();

    return (
        <Card withBorder p="xs" radius="md">
            <Group position="apart">
                <Box className={classes.textContainer}>
                    <Title order={4}>{itemTag.name}</Title>
                    <Text color="dimmed" truncate>
                        {itemTag.description}
                    </Text>
                </Box>
                <Button component={Link} to={`/tags/${itemTag.token}`} radius="md">
                    View
                </Button>
            </Group>
        </Card>
    );
};
