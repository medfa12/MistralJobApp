"use client"

import * as React from "react"
import Link from "next/link"
import { useColorModeValue } from "@chakra-ui/react"
// import { useSelectedLayoutSegment } from "next/navigation"

// import { MainNavItem } from "types"
// import { siteConfig } from "@/config/site"
import { cn } from "../../lib/utils"
import { Icons } from "@/components/icons"
import { MobileNav } from "@/components/mobile-nav"

interface MainNavProps {
  // items?: MainNavItem[]
  children?: React.ReactNode
}

export function MainNav({  children }: MainNavProps) {
  // const segment = useSelectedLayoutSegment()
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false)
  const [mounted, setMounted] = React.useState(false)
  const logoSrc = useColorModeValue('/img/m/m-orange.svg', '/img/m-boxed/m-boxed-orange.svg');

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
      
        <img
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
      {/* {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center text-lg font-semibold text-slate-600 sm:text-sm",
                item.href.startsWith(`/${segment}`) && "text-slate-900",
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null} */}
      <button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? (
          <Icons.close />
        ) : (
          <img
            className="h-auto object-cover"
            src={mounted ? logoSrc : '/img/m/m-orange.svg'}
            width={40}
            height={40}
            alt="logo"
          />
        )}
        <span className="font-bold">Menu</span>
      </button>
      {/* {showMobileMenu && items && (
        <MobileNav items={items}>{children}</MobileNav>
      )} */}
    </div>
  )
}
