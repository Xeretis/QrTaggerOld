import {
    ActionIcon,
    AppShell,
    Box,
    Group,
    Header,
    Menu,
    Text,
    Title,
    createStyles,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { IconLogout, IconMoonStars, IconSun, IconUser } from "@tabler/icons";

import { Outlet } from "react-router-dom";
import { useApiStore } from "../../stores/apiStore";
import { useDeleteApiAuthLogout } from "../../api/auth/auth";
import { useUser } from "../../hooks/useUser";

const useStyles = createStyles((theme) => ({
    header: {
        borderBottom: 0,
    },
    headerContainer: {
        height: "100%",
        maxWidth: "100%",
    },
}));

const ProtectedLayout = (): JSX.Element => {
    const { classes } = useStyles();

    const theme = useMantineTheme();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const logout = useDeleteApiAuthLogout();

    const user = useUser();
    const setUser = useApiStore((state) => state.setUser);

    return (
        <AppShell
            padding="md"
            fixed
            header={
                <Header height={60} className={classes.header}>
                    <Group position="apart" align="center" className={classes.headerContainer} p="sm">
                        <Title order={3} style={{ margin: 0 }} color={theme.fn.primaryColor()}>
                            QrTagger
                        </Title>
                        <Menu position="left-start">
                            <Menu.Target>
                                <ActionIcon variant="transparent" radius="xl" sx={{ height: 30 }}>
                                    <IconUser
                                        color={theme.colorScheme === "light" ? theme.black : theme.white}
                                        size={28}
                                        stroke={1.5}
                                    />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>
                                    Logged in as{" "}
                                    <Text component="span" weight="bold">
                                        {user.userName}
                                    </Text>
                                </Menu.Label>
                                <Menu.Item
                                    icon={colorScheme === "dark" ? <IconSun /> : <IconMoonStars />}
                                    onClick={() => toggleColorScheme()}
                                >
                                    Change theme
                                </Menu.Item>
                                <Menu.Item
                                    icon={<IconLogout />}
                                    onClick={async () => {
                                        try {
                                            await logout.mutateAsync();
                                        } catch (error) {
                                            console.warn(error);
                                        } finally {
                                            setUser(undefined);
                                        }
                                    }}
                                    color="red"
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Header>
            }
        >
            <Outlet />
        </AppShell>
    );
};

export default ProtectedLayout;
