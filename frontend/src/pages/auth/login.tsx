import { Box, Button, Center, PasswordInput, TextInput, Title, createStyles } from "@mantine/core";
import { ValidationErrors, camelize, handleFormErrors } from "../../utils/forms";

import { useApiStore } from "../../stores/apiStore";
import { useForm } from "@mantine/form";
import { usePostApiAuthLogin } from "../../api/auth/auth";

const useStyles = createStyles((theme) => ({
    container: {
        height: "100vh",
    },
    form: {
        display: "flex",
        flexDirection: "column",

        width: "25vw",

        [`@media (max-width: ${theme.breakpoints.lg}px)`]: {
            width: "35vw",
        },

        [`@media (max-width: ${theme.breakpoints.md}px)`]: {
            width: "45vw",
        },

        [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
            width: "65vw",
        },

        [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
            width: "75vw",
        },
    },
}));

const Login = (): JSX.Element => {
    const { classes } = useStyles();

    const setUser = useApiStore((state) => state.setUser);
    const login = usePostApiAuthLogin();

    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },
    });

    const submit = form.onSubmit(async (values) => {
        try {
            const res = await login.mutateAsync({ data: values });
            setUser(res.user);
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

    return (
        <Center className={classes.container}>
            <form className={classes.form} onSubmit={submit}>
                <Title order={1} size="h2" align="center" mb="sm">
                    Log in
                </Title>
                <TextInput label="Email" required type="email" {...form.getInputProps("email")} mb="sm" />
                <PasswordInput label="Password" required {...form.getInputProps("password")} mb="md" />
                <Button type="submit">Log in</Button>
            </form>
        </Center>
    );
};

export default Login;
