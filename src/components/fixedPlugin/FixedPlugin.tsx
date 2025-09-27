'use client'
// Chakra Imports
import { Button, Icon, useColorMode } from '@chakra-ui/react'
// Custom Icons
import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import { isWindowAvailable } from '@/utils/navigation'

export default function FixedPlugin(props: { [x: string]: any }) {
  const { ...rest } = props
  const { colorMode, toggleColorMode } = useColorMode()
  let bgButton = 'linear-gradient(135deg, #FA500F 0%, #FF8205 100%)'

  return (
    <Button
      {...rest}
      h="60px"
      w="60px"
      bg={bgButton}
      zIndex="99"
      position="fixed"
      variant="no-effects"
      left={
        isWindowAvailable() && document.documentElement.dir === 'rtl'
          ? '35px'
          : ''
      }
      right={
        isWindowAvailable() && document.documentElement.dir === 'rtl'
          ? ''
          : '35px'
      }
      bottom="30px"
      border="1px solid"
      borderColor="#FF8205"
      borderRadius="50px"
      onClick={toggleColorMode}
      display="flex"
      p="0px"
      alignItems="center"
      justifyContent="center"
    >
      <Icon
        h="24px"
        w="24px"
        color="white"
        as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
      />
    </Button>
  )
}
