import {
    Affix,
    Anchor,
    Box,
    Button,
    Center,
    Group,
    Input,
    Paper,
    ScrollArea,
    SimpleGrid,
    Text,
    Title,
    createStyles,
    useMantineTheme,
} from "@mantine/core";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { ChatCard } from "../components/chatCard";
import { FullScreenLoading } from "../components/fullScreenLoading";
import { IndexChatMessagesResponse } from "../api/model";
import dayjs from "dayjs";
import { useApiStore } from "../stores/apiStore";
import { useGetApiChatToken } from "../api/chat/chat";
import { useGetApiItemTagsToken } from "../api/item-tags/item-tags";
import { useUser } from "../hooks/useUser";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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
}));

const UserChat = ({ token, tagId }: { token: string; tagId: number }): JSX.Element => {
    const { classes } = useStyles();
    const theme = useMantineTheme();

    const [selectedMessages, setSelectedMessages] = useState<IndexChatMessagesResponse | undefined>(undefined);
    const [connection, setConnection] = useState<HubConnection | undefined>(undefined);

    const messagesQuery = useGetApiChatToken(token);
    const [messages, setMessages] = useState<IndexChatMessagesResponse[]>([]);
    const [message, setMessage] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        if (messagesQuery.data) {
            setMessages(messagesQuery.data);
        }
    }, [messagesQuery]);

    useEffect(() => {
        const hubConnection = new HubConnectionBuilder()
            .withUrl("/Hubs/Chat")
            .configureLogging(LogLevel.Information)
            .build();

        (async () => {
            hubConnection.on("MessageReceived", (message, userId) => {
                console.log("MessageReceived");
                const messageData = messages.find((m) => m.userId === userId);
                if (messageData) {
                    messageData.messages.push({
                        message,
                        owned: false,
                        createdAt: dayjs().utc().toISOString(),
                    });
                    setMessages((messages) => [...messages, messageData]);
                } else {
                    setMessages((messages) => [
                        ...messages,
                        {
                            userId,
                            messages: [
                                {
                                    message,
                                    owned: false,
                                    createdAt: dayjs().utc().toISOString(),
                                },
                            ],
                        },
                    ]);
                }
            });

            try {
                await hubConnection.start();
                console.log("Connected");
                setConnection(hubConnection);
            } catch (err) {
                console.error(err);
            }
        })();

        return () => {
            hubConnection.stop();
        };
    }, []);

    if (messagesQuery.isLoading) return <FullScreenLoading />;

    if (messagesQuery.isError) {
        return (
            <Center className={classes.errorContainer} m="xs">
                <Title color="red" align="center">
                    Failed to load messages
                </Title>
                <Text color="red" align="center">
                    {" "}
                    Please try again later.
                </Text>
            </Center>
        );
    }

    if (selectedMessages) {
        const renderedMessages = messages
            .find((m) => m.userId === selectedMessages.userId)
            .messages.map((message, index) => (
                <Paper
                    key={index}
                    sx={(theme) => ({
                        backgroundColor: message.owned
                            ? theme.colorScheme === "dark"
                                ? theme.colors[theme.primaryColor][9]
                                : theme.colors[theme.primaryColor][6]
                            : theme.colorScheme === "dark"
                            ? theme.colors.gray[9]
                            : theme.colors.gray[0],
                    })}
                    radius="md"
                    p="md"
                    my="sm"
                >
                    <Text size="sm" color={"gray.2"}>
                        {dayjs(message.createdAt).format("HH:mm")}
                    </Text>
                    <Text size="sm" color={theme.colorScheme === "dark" ? "white" : "black"}>
                        {message.message}
                    </Text>
                </Paper>
            ));

        return (
            <Box p="md">
                <Group position="apart" mb="lg">
                    <Title order={1} size="h3" truncate>
                        Chatting with {selectedMessages.userId}
                    </Title>
                    <Button variant="light" onClick={() => setSelectedMessages(undefined)}>
                        Back
                    </Button>
                </Group>
                <Box pb={40}>{renderedMessages}</Box>
                <Affix position={{ bottom: 20, left: 16, right: 16 }}>
                    <Group>
                        <Input
                            value={message}
                            onChange={(event) => setMessage(event.currentTarget.value)}
                            sx={{ flex: 1 }}
                            placeholder="Type a message"
                            id="input-msg"
                        />
                        <Button
                            onClick={async () => {
                                await connection?.invoke("SendMessage", tagId, selectedMessages.userId, message);
                                const messageData = messages.find((m) => m.userId === selectedMessages.userId);
                                messageData.messages.push({
                                    message,
                                    owned: true,
                                    createdAt: dayjs().utc().toISOString(),
                                });
                                console.log(messageData);
                                setMessages((messages) => [...messages, messageData]);
                                // reset input box after send
                                setMessage("");
                            }}
                        >
                            Send
                        </Button>
                    </Group>
                </Affix>
            </Box>
        );
    }

    return (
        <Box p="md">
            <Group position="apart" mb="md">
                <Title order={1} size="h3">
                    Chats related to this tag
                </Title>
                <Button variant="light" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Group>
            <SimpleGrid
                cols={4}
                spacing="lg"
                breakpoints={[
                    { maxWidth: 1524, cols: 3, spacing: "md" },
                    { maxWidth: 1184, cols: 2, spacing: "sm" },
                    { maxWidth: 784, cols: 1, spacing: "sm" },
                ]}
            >
                {messages?.map((messagesData) => (
                    <ChatCard
                        key={messagesData.userId}
                        messages={messagesData}
                        onSelect={(messages) => setSelectedMessages(messages)}
                    />
                ))}
            </SimpleGrid>
        </Box>
    );
};

const GuestChat = ({ token, tagId, toId }: { token: string; tagId: number; toId: string }): JSX.Element => {
    const { classes } = useStyles();
    const theme = useMantineTheme();

    const [connection, setConnection] = useState<HubConnection | undefined>(undefined);

    const messagesQuery = useGetApiChatToken(token);
    const [messages, setMessages] = useState<IndexChatMessagesResponse[]>([]);
    const [message, setMessage] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        if (messagesQuery.data) {
            setMessages(messagesQuery.data);
        }
    }, [messagesQuery]);

    useEffect(() => {
        const hubConnection = new HubConnectionBuilder()
            .withUrl("/Hubs/Chat")
            .configureLogging(LogLevel.Information)
            .build();

        (async () => {
            hubConnection.on("MessageReceived", (message, userId) => {
                console.log("MessageReceived");
                const messageData = messages.find((m) => m.userId === userId);
                if (messageData) {
                    messageData.messages.push({
                        message,
                        owned: false,
                        createdAt: dayjs().utc().toISOString(),
                    });
                    setMessages([...messages, messageData]);
                } else {
                    setMessages([
                        ...messages,
                        {
                            userId,
                            messages: [
                                {
                                    message,
                                    owned: false,
                                    createdAt: dayjs().utc().toISOString(),
                                },
                            ],
                        },
                    ]);
                }
            });

            try {
                await hubConnection.start();
                console.log("Connected");
                setConnection(hubConnection);
            } catch (err) {
                console.error(err);
            }
        })();

        return () => {
            hubConnection.stop();
        };
    }, []);

    const renderedMessages = messages.find((m) => m.userId === toId)
        ? messages
              .find((m) => m.userId === toId)
              .messages.map((message, index) => (
                  <Paper
                      key={index}
                      sx={(theme) => ({
                          backgroundColor: message.owned
                              ? theme.colorScheme === "dark"
                                  ? theme.colors[theme.primaryColor][9]
                                  : theme.colors[theme.primaryColor][6]
                              : theme.colorScheme === "dark"
                              ? theme.colors.gray[9]
                              : theme.colors.gray[0],
                      })}
                      radius="md"
                      p="md"
                      my="sm"
                  >
                      <Text size="sm" color={"gray.2"}>
                          {dayjs(message.createdAt).format("HH:mm")}
                      </Text>
                      <Text size="sm" color={theme.colorScheme === "dark" ? "white" : "black"}>
                          {message.message}
                      </Text>
                  </Paper>
              ))
        : [];

    return (
        <Box p="md">
            <Group position="apart" mb="lg">
                <Title order={1} size="h3" truncate>
                    Chatting with item owner
                </Title>
                <Button variant="light" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Group>
            <Box pb={40}>{renderedMessages}</Box>
            <Affix position={{ bottom: 20, left: 16, right: 16 }}>
                <Group>
                    <Input
                        value={message}
                        onChange={(event) => setMessage(event.currentTarget.value)}
                        sx={{ flex: 1 }}
                        placeholder="Type a message"
                        id="input-msg"
                    />
                    <Button
                        onClick={async () => {
                            await connection?.invoke("SendMessage", tagId, toId, message);
                            const messageData = messages.find((m) => m.userId === toId);
                            if (messageData) {
                                messageData.messages.push({
                                    message,
                                    owned: true,
                                    createdAt: dayjs().utc().toISOString(),
                                });
                                setMessages((messages) => [...messages, messageData]);
                            } else {
                                setMessages([
                                    ...messages,
                                    {
                                        userId: toId,
                                        messages: [
                                            {
                                                message,
                                                owned: true,
                                                createdAt: dayjs().utc().toISOString(),
                                            },
                                        ],
                                    },
                                ]);
                            }
                            // reset input box after send
                            setMessage("");
                        }}
                    >
                        Send
                    </Button>
                </Group>
            </Affix>
        </Box>
    );
};

const Chat = (): JSX.Element => {
    const { classes } = useStyles();

    const { token } = useParams<{ token: string }>();
    const itemTag = useGetApiItemTagsToken(token);

    const user = useUser();
    const chatAuthenticated = useApiStore((state) => state.chatAuthenticated);

    if (!chatAuthenticated && !user) {
        return (
            <Center className={classes.errorContainer} m="xs">
                <Title color="red" align="center">
                    It seems like you are not authenticated
                </Title>
                <Text color="red" align="center">
                    {" "}
                    Don't worry, you don't have to register to chat, but you either need to be logged in or have entered
                    the chat from{" "}
                    <Anchor component={Link} to={`/tags/view/${token}`}>
                        here
                    </Anchor>
                    .
                </Text>
            </Center>
        );
    }

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

    return user && user.id == itemTag.data.ownerId ? (
        <UserChat token={token} tagId={itemTag.data.id} />
    ) : (
        <GuestChat token={token} tagId={itemTag.data.id} toId={itemTag.data.ownerId} />
    );
};

export default Chat;
