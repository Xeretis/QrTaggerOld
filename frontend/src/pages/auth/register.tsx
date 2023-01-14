import { Box, Button, Center, PasswordInput, TextInput, Title, createStyles } from "@mantine/core";
import { ValidationErrors, camelize, handleFormErrors } from "../../utils/forms";
import { usePostApiAuthLogin, usePostApiAuthRegister } from "../../api/auth/auth";

import { useApiStore } from "../../stores/apiStore";
import { useForm } from "@mantine/form";

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

const Register = (): JSX.Element => {
    const { classes } = useStyles();

    const setUser = useApiStore((state) => state.setUser);

    const register = usePostApiAuthRegister();
    const login = usePostApiAuthLogin();

    const form = useForm({
        initialValues: {
            email: "",
            userName: "",
            password: "",
            confirmPassword: "",
        },
    });

    const submit = form.onSubmit(async (values) => {
        try {
            await register.mutateAsync({ data: values });
            const res = await login.mutateAsync({ data: { email: values.email, password: values.password } });
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
                    Register
                </Title>
                <TextInput label="Email" required type="email" {...form.getInputProps("email")} mb="sm" />
                <TextInput label="Username" required {...form.getInputProps("userName")} mb="sm" />
                <PasswordInput label="Password" required {...form.getInputProps("password")} mb="sm" />
                <PasswordInput label="Confirm Password" required {...form.getInputProps("confirmPassword")} mb="md" />
                <Button type="submit">Register</Button>
            </form>
        </Center>
    );
};

export default Register;
