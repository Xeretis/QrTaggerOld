import {
    Box,
    Button,
    Center,
    Divider,
    Group,
    Image,
    Select,
    Text,
    TextInput,
    Title,
    createStyles,
} from "@mantine/core";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { UpdateItemTagRequest, ViewItemTagResponse } from "../../api/model";
import { ValidationErrors, camelize, handleFormErrors } from "../../utils/forms";
import { closeAllModals, openModal } from "@mantine/modals";
import { isNotEmpty, useForm } from "@mantine/form";
import { useDeleteApiItemTagsId, useGetApiItemTagsToken, usePutApiItemTagsId } from "../../api/item-tags/item-tags";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FullScreenLoading } from "../../components/fullScreenLoading";
import { IconX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";

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
    dataContainer: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flex: 1,

        [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
            flexDirection: "column",
            alignItems: "center",
        },
    },
    innerDataContainer: {
        width: "100%",
        marginLeft: theme.spacing.xl,

        [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
            marginLeft: 0,
        },
    },
}));

const EditItemTagModalContent = ({ itemTag, itemTagKey }: { itemTag: ViewItemTagResponse; itemTagKey: QueryKey }) => {
    const createItemTag = usePutApiItemTagsId();

    const queryClient = useQueryClient();

    const form = useForm<UpdateItemTagRequest>({
        initialValues: itemTag as UpdateItemTagRequest,
        validate: {
            fieldGroups: {
                fields: isNotEmpty("At least one field must be specified"),
            },
        },
    });

    const [selectedGroup, setSelectedGroup] = useState(form.values.fieldGroups[0].language);

    const submit = form.onSubmit(async (values) => {
        try {
            await createItemTag.mutateAsync({ id: itemTag.id, data: values });
            queryClient.invalidateQueries(itemTagKey);
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
                <Button type="submit" disabled={!canSave}>
                    Save
                </Button>
            </Group>
        </form>
    );
};

const Tag = (): JSX.Element => {
    const { classes } = useStyles();

    const { token } = useParams();

    const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
    const [isInitialGroupSet, setIsInitialGroupSet] = useState<boolean>(false);

    const itemTag = useGetApiItemTagsToken(token);
    const deleteTag = useDeleteApiItemTagsId();
    const queryClient = useQueryClient();

    const navigate = useNavigate();

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

    const openEditModal = () => {
        openModal({
            title: "Edit item tag",
            size: "lg",
            children: <EditItemTagModalContent itemTag={itemTag.data} itemTagKey={itemTag.queryKey} />,
        });
    };

    const languageData = itemTag.data.fieldGroups.map((g) => ({
        label: g.language,
        value: g.language,
    }));

    const fields = itemTag.data.fieldGroups[selectedGroupIndex].fields.map((f, index) => (
        <Group position="apart" key={f.value}>
            <Text>{f.name}</Text>
            <Text>{f.value}</Text>
        </Group>
    ));

    return (
        <Box>
            <Group position="apart" mb="md">
                <Title order={1} size="h3">
                    View tag
                </Title>
                <Group>
                    <Button variant="light" onClick={() => navigate(-1)}>
                        Go back
                    </Button>
                    <Button onClick={openEditModal}>Edit</Button>
                    <Button
                        color="red"
                        onClick={async () => {
                            try {
                                await deleteTag.mutateAsync({ id: itemTag.data.id });
                                queryClient.invalidateQueries(itemTag.queryKey);
                                navigate("/");
                            } catch (e) {
                                console.warn(e);
                                showNotification({
                                    title: "Hiba",
                                    color: "red",
                                    icon: <IconX />,
                                    message: "Deleting the tag failed. Please try again later.",
                                });
                            }
                        }}
                    >
                        Delete
                    </Button>
                </Group>
            </Group>
            <Box className={classes.dataContainer}>
                <Image
                    src={`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(itemTag.data.qrCode)))}`}
                    width={350}
                />
                <Box className={classes.innerDataContainer}>
                    <Group position="apart" spacing={0}>
                        <Text weight={600} size="xl">
                            Name:{" "}
                        </Text>
                        <Text size="xl">{itemTag.data.name}</Text>
                    </Group>
                    <Group position="apart" spacing={0}>
                        <Text weight={600} size="xl">
                            Description:{" "}
                        </Text>
                        <Text color="dimmed" size="xl">
                            {itemTag.data.description}
                        </Text>
                    </Group>
                    <Divider my="sm" variant="dashed" />
                    <Group position="apart" mb="sm">
                        <Text weight={600} size="xl">
                            Fields
                        </Text>
                        <Select data={languageData} value={selectedGroup} onChange={setSelectedGroup} />
                    </Group>
                    {fields}
                </Box>
            </Box>
        </Box>
    );
};

export default Tag;
