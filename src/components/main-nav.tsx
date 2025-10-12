"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useColorModeValue } from "@chakra-ui/react"

import { cn } from "../../lib/utils"
import { Icons } from "@/components/icons"
import { MobileNav } from "@/components/mobile-nav"

interface MainNavProps {
  children?: React.ReactNode
}

export function MainNav({  children }: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false)
  const [mounted, setMounted] = React.useState(false)
  const logoSrc = useColorModeValue('/img/m/m-orange.svg', '/img/m-boxed/m-boxed-orange.svg');

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">

        <Image
          className="h-auto object-cover"
          src={mounted ? logoSrc : '/img/m/m-orange.svg'}
          width={40}
          height={40}
          alt="logo"
        />

        <span className="hidden font-bold sm:inline-block">
      Mistral AI Demo
        </span>
      </Link>
      <nav className="hidden gap-6 md:flex">

        </nav>
      {
}
      <button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? (
          <Icons.close />
        ) : (
          <Image
            className="h-auto object-cover"
            src={mounted ? logoSrc : '/img/m/m-orange.svg'}
            width={40}
            height={40}
            alt="logo"
          />
        )}
        <span className="font-bold">Menu</span>
      </button>
      {
}
    </div>
  )
}
