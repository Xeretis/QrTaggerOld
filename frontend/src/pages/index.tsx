import { Box, Button, Center, Group, Text, Title, createStyles, useMantineTheme } from "@mantine/core";
import { useEffect, useRef } from "react";

import { Link } from "react-router-dom";

const useStyles = createStyles((theme) => ({
    landingContainer: {
        height: "100vh",
        flexDirection: "column",
    },
    dottedBg: {
        position: "absolute",
        right: 50,
        bottom: 50,
        zIndex: -1,
        width: "30vw",
        height: "30vw",

        backgroundImage: `radial-gradient(${
            theme.colorScheme === "dark" ? theme.colors.gray[8] : theme.colors.gray[2]
        } 3px, transparent 0)`,
        backgroundSize: "50px 50px",

        [`@media (max-width: ${theme.breakpoints.lg + 60}px)`]: {
            bottom: 100,
            width: "60vw",
            height: "52vw",
        },
        [`@media (max-width: ${theme.breakpoints.xs + 60}px)`]: {
            display: "none",
        },
    },
}));

const Index = (): JSX.Element => {
    const { classes } = useStyles();
    const theme = useMantineTheme();

    return (
        <>
            <Center className={classes.landingContainer} p="md">
                <Title order={1} size={72} align="center" color={theme.fn.primaryColor()}>
                    QrTagger
                </Title>
                <Text color="dimmed" align="center">
                    The ultimate free solution to tag your luggage and other items
                </Text>
                <Group mt="md">
                    <Button component={Link} to="/auth/login" variant="outline">
                        Login
                    </Button>
                    <Button component={Link} to="/auth/register" variant="outline">
                        Register
                    </Button>
                </Group>
            </Center>
            <Box className={classes.dottedBg} />
        </>
    );
};

export default Index;
