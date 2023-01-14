import { Box, Button, Center, Group, Select, Text, Title, createStyles, useMantineTheme } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FullScreenLoading } from "../components/fullScreenLoading";
import { IconX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { useApiStore } from "../stores/apiStore";
import { useGetApiItemTagsToken } from "../api/item-tags/item-tags";
import { usePostApiChatAuth } from "../api/chat/chat";
import { usePostApiLocationToken } from "../api/location/location";
import { useUser } from "../hooks/useUser";

const useStyles = createStyles((theme) => ({
    errorContainer: {
        height: "100vh",
        zIndex: -1,
        top: 0,
        left: 0,
        right: 0,
        position: "fixed",
        flexDirection: "column",
    },
    container: {
        height: "100vh",
    },
    dataContainer: {
        display: "flex",
        flexDirection: "column",

        width: "35vw",

        [`@media (max-width: ${theme.breakpoints.lg}px)`]: {
            width: "45vw",
        },

        [`@media (max-width: ${theme.breakpoints.md}px)`]: {
            width: "55vw",
        },

        [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
            width: "65vw",
        },

        [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
            width: "75vw",
        },
    },
}));

const ViewTag = (): JSX.Element => {
    const { classes } = useStyles();
    const theme = useMantineTheme();

    const { token } = useParams<{ token: string }>();

    const itemTag = useGetApiItemTagsToken(token);
    const shareLocation = usePostApiLocationToken();
    const chatAuth = usePostApiChatAuth();

    const chatAuthenticated = useApiStore((state) => state.chatAuthenticated);
    const setChatAuthenticated = useApiStore((state) => state.setChatAuthenticated);
    const user = useUser();

    const navigate = useNavigate();

    const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
    const [isInitialGroupSet, setIsInitialGroupSet] = useState<boolean>(false);

    useEffect(() => {
        if (!isInitialGroupSet && itemTag.data) {
            setSelectedGroup(itemTag.data.fieldGroups[0].language);
            setIsInitialGroupSet(true);
        }
    }, [itemTag, isInitialGroupSet]);

    const selectedGroupIndex = useMemo(() => {
        if (itemTag.data && selectedGroup)
            return itemTag.data.fieldGroups.findIndex((g) => g.language === selectedGroup);
        return 0;
    }, [itemTag, selectedGroup]);

    if (itemTag.isLoading) return <FullScreenLoading />;

    if (itemTag.isError) {
        return (
            <Center className={classes.errorContainer} m="xs">
                <Title color="red" align="center">
                    Failed to load item tag
                </Title>
                <Text color="red" align="center">
                    {" "}
                    Please try again later.
                </Text>
            </Center>
        );
    }

    const shareLoc = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                await shareLocation.mutateAsync({
                    data: {
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                    },
                    token,
                });
            });
        } else {
            showNotification({
                title: "Error",
                color: "red",
                icon: <IconX />,
                message: "It seems like your browser does not support geolocation.",
            });
        }
    };

    const enterChat = async () => {
        if (!chatAuthenticated && !user) {
            try {
                await chatAuth.mutateAsync();
                setChatAuthenticated(true);
            } catch (e) {
                showNotification({
                    title: "Error",
                    color: "red",
                    icon: <IconX />,
                    message: "An error occured while authenticating you for the chat. Please try again later.",
                });
            }
        }

        navigate(`/chat/${token}`);
    };

    const languageData = itemTag.data.fieldGroups.map((g) => ({
        label: g.language,
        value: g.language,
    }));

    const fields = itemTag.data.fieldGroups[selectedGroupIndex].fields.map((f, index) => (
        <Group position="apart" key={f.value}>
            <Text weight={600}>{f.name}</Text>
            <Text>{f.value}</Text>
        </Group>
    ));

    return (
        <Center className={classes.container}>
            <Box className={classes.dataContainer}>
                <Text size="xl" align="center">
                    Thank you for finding{" "}
                    <Text component="span" color={theme.fn.primaryColor()} weight={600}>
                        {itemTag.data.name}
                    </Text>
                </Text>
                <Text color="dimmed" align="center" mb="xl">
                    Please help returning it by sharing your location
                </Text>
                <Group position="apart" mb="md">
                    <Text>Language</Text>
                    <Select data={languageData} value={selectedGroup} onChange={setSelectedGroup} />
                </Group>
                {fields}
                <Group mt="md">
                    <Button onClick={shareLoc} loading={shareLocation.isLoading} sx={{ flex: 2 }}>
                        Share location
                    </Button>
                    <Button onClick={enterChat} sx={{ flex: 2 }}>
                        Enter chat
                    </Button>
                </Group>
            </Box>
        </Center>
    );
};

export default ViewTag;
