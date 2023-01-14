import { Box, Button, createStyles } from "@mantine/core";

import { useApiStore } from "../../stores/apiStore";
import { useDeleteApiAuthLogout } from "../../api/auth/auth";

const useStyles = createStyles((theme) => ({}));

const Home = (): JSX.Element => {
    const { classes } = useStyles();

    const logout = useDeleteApiAuthLogout();
    const setUser = useApiStore((state) => state.setUser);

    return (
        <Box>
            <Button
                onClick={async () => {
                    await logout.mutateAsync();
                    setUser(undefined);
                }}
            >
                Logout
            </Button>
        </Box>
    );
};

export default Home;
