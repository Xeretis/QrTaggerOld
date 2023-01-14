import { Box, Button, Center, Group, Select, SimpleGrid, Text, TextInput, Title, createStyles } from "@mantine/core";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { ValidationErrors, camelize, handleFormErrors } from "../../utils/forms";
import { closeAllModals, openModal } from "@mantine/modals";
import { isNotEmpty, useForm } from "@mantine/form";
import { useGetApiItemTags, usePostApiItemTags } from "../../api/item-tags/item-tags";
import { useMemo, useState } from "react";

import { CreateItemTagRequest } from "../../api/model";
import { FullScreenLoading } from "../../components/fullScreenLoading";
import { ItemTagCard } from "../../components/itemTagCard";

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

const CreateItemTagModalContent = ({ itemTagsKey }: { itemTagsKey: QueryKey }) => {
    const createItemTag = usePostApiItemTags();

    const queryClient = useQueryClient();

    const form = useForm<CreateItemTagRequest>({
        initialValues: {
            name: "",
            description: "",
            fieldGroups: [
                {
                    language: "English",
                    fields: [],
                },
            ],
        },
        validate: {
            fieldGroups: {
                fields: isNotEmpty("At least one field must be specified"),
            },
        },
    });

    const [selectedGroup, setSelectedGroup] = useState(form.values.fieldGroups[0].language);

    const submit = form.onSubmit(async (values) => {
        try {
            await createItemTag.mutateAsync({ data: values });
            queryClient.invalidateQueries(itemTagsKey);
            closeAllModals();
        } catch (error) {
            console.warn(error);
            handleFormErrors(error, handleValidationErrors);
        }
    });

    const handleValidationErrors = (errors: ValidationErrors) => {
        for (const validationError in errors) {
            let message = "";
            for (const err of errors[validationError]) {
                message += `${err}\n`;
            }
            form.setFieldError(camelize(validationError), message);
        }
    };

    const groupData = form.values.fieldGroups.map((g, index) => ({
        label: g.language,
        value: g.language,
    }));

    const selectedGroupIndex = useMemo(() => {
        return form.values.fieldGroups.findIndex((g) => g.language === selectedGroup);
    }, [form, selectedGroup]);

    const fields = form.values.fieldGroups[selectedGroupIndex].fields.map((f, index) => (
        <Group key={index} mb="sm">
            <TextInput
                label="Name"
                {...form.getInputProps(`fieldGroups.${selectedGroupIndex}.fields.${index}.name`)}
                required
                sx={{ flex: 2 }}
            />
            <TextInput
                label="Value"
                {...form.getInputProps(`fieldGroups.${selectedGroupIndex}.fields.${index}.value`)}
                required
                sx={{ flex: 2 }}
            />
        </Group>
    ));

    const canSave = useMemo(() => {
        if (form.values.fieldGroups.length < 1) return false;

        for (const group of form.values.fieldGroups) {
            if (group.fields.length < 1) return false;

            for (const field of group.fields) {
                if (field.name.length < 1 || field.value.length < 1) return false;
            }
        }

        return true;
    }, [form]);

    return (
        <form onSubmit={submit}>
            <TextInput label="Name" required {...form.getInputProps("name")} mb="sm" />
            <TextInput label="Description" required {...form.getInputProps("description")} mb="sm" />
            <Group position="apart">
                <Select
                    label="Language"
                    data={groupData}
                    creatable
                    searchable
                    onCreate={(query) => {
                        form.insertListItem("fieldGroups", { language: query, fields: [] });
                        return query;
                    }}
                    getCreateLabel={(query) => `+ Create ${query}`}
                    value={selectedGroup}
                    onChange={setSelectedGroup}
                    sx={{ flex: 1 }}
                />
                <Button
                    color="red"
                    disabled={form.values.fieldGroups.length <= 1}
                    onClick={() => {
                        form.removeListItem("fieldGroups", selectedGroupIndex);
                        setSelectedGroup(form.values.fieldGroups[0].language);
                    }}
                    sx={{ alignSelf: "flex-end" }}
                >
                    Delete
                </Button>
            </Group>
            {fields.length > 0 ? (
                fields
            ) : (
                <Text color="dimmed" align="center" my="md">
                    Create a new field before saving
                </Text>
            )}
            <Group position="apart">
                <Button
                    variant="light"
                    onClick={() => {
                        form.insertListItem(`fieldGroups.${selectedGroupIndex}.fields`, { name: "", value: "" });
                    }}
                >
                    Create new field
                </Button>
                <Button type="submit" disabled={!canSave} loading={createItemTag.isLoading}>
                    Save
                </Button>
            </Group>
        </form>
    );
};

const Home = (): JSX.Element => {
    const { classes } = useStyles();

    const itemTags = useGetApiItemTags();

    if (itemTags.isLoading) {
        return <FullScreenLoading />;
    }

    if (itemTags.isError) {
        return (
            <Center className={classes.errorContainer} m="xs">
                <Title color="red" align="center">
                    Failed to load item tags
                </Title>
                <Text color="red" align="center">
                    {" "}
                    Please try again later.
                </Text>
            </Center>
        );
    }

    const openCreateModal = () => {
        openModal({
            title: "Create item tag",
            size: "lg",
            children: <CreateItemTagModalContent itemTagsKey={itemTags.queryKey} />,
        });
    };

    return (
        <Box>
            <Group position="apart" mb="md">
                <Title order={1} size="h3">
                    Item tags
                </Title>
                <Button onClick={openCreateModal}>Create new tag</Button>
            </Group>
            {itemTags.data.length < 1 && (
                <Text color="dimmed">
                    Seems like you don't have any tags just yet... Create one to see something here.
                </Text>
            )}
            <SimpleGrid
                cols={4}
                spacing="lg"
                breakpoints={[
                    { maxWidth: 1524, cols: 3, spacing: "md" },
                    { maxWidth: 1184, cols: 2, spacing: "sm" },
                    { maxWidth: 784, cols: 1, spacing: "sm" },
                ]}
            >
                {itemTags.data.map((tag) => (
                    <ItemTagCard key={tag.id} itemTag={tag} />
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default Home;
