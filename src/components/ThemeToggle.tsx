import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { TbMoon, TbSun } from "react-icons/tb";

const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark: boolean = colorScheme === "dark";

  const handleToggleSwitch = () => {
    toggleColorScheme();
  };

  return (
    <ActionIcon
      size="lg"
      variant="outline"
      color="transparent"
      onClick={handleToggleSwitch}
    >
      {isDark ? <TbSun size={18} /> : <TbMoon size={18} />}
    </ActionIcon>
  );
};

export default ThemeToggle;
