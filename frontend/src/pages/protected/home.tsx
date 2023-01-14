import { Box, Button, createStyles } from "@mantine/core";

import { FullScreenLoading } from "../../components/fullScreenLoading";
import { useGetApiItemTags } from "../../api/item-tags/item-tags";

const useStyles = createStyles((theme) => ({}));

const Home = (): JSX.Element => {
    const { classes } = useStyles();

    const itemTags = useGetApiItemTags();

    if (itemTags.isLoading) {
        return <FullScreenLoading />;
    }

    return (
        <Box>
            <Button>Logout</Button>
        </Box>
    );
};

export default Home;
