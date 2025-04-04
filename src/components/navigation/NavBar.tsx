'use client';

import { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown } from 'lucide-react';
import styles from '@/styles/NavBar.module.css';

// TypeScript interfaces
interface NavItem {
  label: string;
  href: string;
  dropdownItems?: NavItem[];
}

interface NavBarProps {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  user?: User | null;
}

// Navigation items configuration
const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Predictive Analysis', href: '/predictive-analysis' },
  { label: 'About', href: '/about' },
  {
    label: 'Help',
    href: '/help',
    dropdownItems: [
      { label: 'FAQ', href: '/help/faq' },
      { label: 'Support', href: '/help/support' },
      { label: 'Contact', href: '/help/contact' },
    ],
  },
  { label: 'Document', href: '/document' },
  { label: 'Workout', href: '/workout' },
];

export default function NavBar({ logo, user }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen],
  );

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const hasDropdown = item.dropdownItems && item.dropdownItems.length > 0;

    if (hasDropdown) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`flex items-center gap-1 ${styles.navLink} ${isActive ? styles.activeLink : ''}`}
            >
              {item.label}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {item.dropdownItems?.map((dropdownItem) => (
              <DropdownMenuItem key={dropdownItem.href}>
                <Link
                  href={dropdownItem.href}
                  className={`w-full ${styles.navLink} ${pathname === dropdownItem.href ? styles.activeLink : ''}`}
                >
                  {dropdownItem.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        href={item.href}
        className={`px-4 py-2 rounded-md transition-colors ${styles.navLink} ${isActive ? styles.activeLink : ''}`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="w-auto h-12 max-h-[48px] object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Authentication button */}
          <div className="hidden md:flex md:items-center md:ml-4">
            {user?.id ? (
              <Button variant={'secondary'} asChild={true}>
                <Link href={'/dashboard'}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild={true} variant={'secondary'}>
                <Link href={'/login'}>Sign in</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Authentication button for mobile */}
            {user?.id ? (
              <Button variant={'secondary'} size="sm" asChild={true}>
                <Link href={'/dashboard'}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild={true} variant={'secondary'} size="sm">
                <Link href={'/login'}>Sign in</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="inline-flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden ${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : styles.mobileMenuClosed}`}
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.href} className="block py-2">
              {item.dropdownItems ? (
                <div className="space-y-2">
                  <div className="px-3 text-sm font-medium text-foreground/70">{item.label}</div>
                  {item.dropdownItems.map((dropdownItem) => (
                    <Link
                      key={dropdownItem.href}
                      href={dropdownItem.href}
                      className={`block px-3 py-2 text-base font-medium rounded-md ${
                        styles.navLink
                      } ${pathname === dropdownItem.href ? styles.activeLink : ''}`}
                      onClick={() => setIsOpen(false)}
                    >
                      {dropdownItem.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    styles.navLink
                  } ${pathname === item.href ? styles.activeLink : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
