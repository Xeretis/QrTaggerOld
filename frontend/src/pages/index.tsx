import { Box, Button, Title, createStyles } from "@mantine/core";

import { Link } from "react-router-dom";

const useStyles = createStyles((theme) => ({}));

const Index = (): JSX.Element => {
    const { classes } = useStyles();

    return (
        <Box>
            <Title>Index</Title>
            <Button component={Link} to="auth/login">
                Login
            </Button>
            <Button component={Link} to="auth/register">
                Register
            </Button>
        </Box>
    );
};

export default Index;
