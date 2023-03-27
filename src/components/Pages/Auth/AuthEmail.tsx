import { Autocomplete, AutocompleteProps } from "@mantine/core";

type Props = AutocompleteProps;

export const getEmailSuggestions = (input: string) =>
  input.trim().length > 0 && !input.includes("@")
    ? ["gmail.com", "outlook.com", "yahoo.com"].map(
        (provider) => `${input}@${provider}`
      )
    : [];

const AuthEmail = ({ value, data = [], ...rest }: Props) => {
  return (
    <Autocomplete
      value={value}
      data={value ? getEmailSuggestions(value) : data}
      {...rest}
    />
  );
};

export default AuthEmail;
