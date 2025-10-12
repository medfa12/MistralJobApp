'use client';

import { IconButton, IconButtonProps, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { FC, ReactElement } from 'react';

interface ToolbarButtonProps extends Omit<IconButtonProps, 'aria-label'> {
  label: string;
  icon: ReactElement;
  isActive?: boolean;
}

export const ToolbarButton: FC<ToolbarButtonProps> = ({
  label,
  icon,
  isActive = false,
  ...props
}) => {
  const activeColor = 'orange.500';
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('orange.50', 'orange.900');

  return (
    <Tooltip label={label}>
      <IconButton
        aria-label={label}
        icon={icon}
        size="sm"
        variant="ghost"
        color={isActive ? activeColor : undefined}
        bg={isActive ? activeBg : undefined}
        _hover={{ bg: hoverBg }}
        {...props}
      />
    </Tooltip>
  );
};
