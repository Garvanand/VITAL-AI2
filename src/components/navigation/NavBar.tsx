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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import styles from '@/styles/NavBar.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

// Animation variants
const logoVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.1 + i * 0.05,
      ease: 'easeOut',
    },
  }),
};

const mobileMenuVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

// Navigation items configuration
const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Predictive Analysis', href: '/predictive-analysis' },
  { label: 'About', href: '/about' },
  // { label: 'Indian Cuisine', href: '/indian-cuisine' },
  {
    label: 'Help',
    href: '/help',
    dropdownItems: [
      { label: 'FAQ', href: '/help/faq' },
      { label: 'Support', href: '/help/support' },
      { label: 'Contact', href: '/help/contact' },
    ],
  },
  { label: 'Document', href: '/documents' },
  { label: 'Workout', href: '/workout' },
];

export default function NavBar({ logo, user: propUser }: NavBarProps) {
  const { user: contextUser, userProfile, logout } = useUser();
  const user = propUser || contextUser;
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userProfile?.full_name) {
      const names = userProfile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      } else if (names.length === 1 && names[0].length > 0) {
        return names[0][0].toUpperCase();
      }
    }

    // Fallback to email
    if (user?.email) {
      return user.email[0].toUpperCase();
    }

    return 'U';
  };

  const NavLink = ({ item, index }: { item: NavItem; index: number }) => {
    const isActive = pathname === item.href;
    const hasDropdown = item.dropdownItems && item.dropdownItems.length > 0;

    if (hasDropdown) {
      return (
        <motion.div custom={index} initial="hidden" animate="visible" variants={navItemVariants}>
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
        </motion.div>
      );
    }

    return (
      <motion.div custom={index} initial="hidden" animate="visible" variants={navItemVariants}>
        <Link
          href={item.href}
          className={`px-4 py-2 rounded-md transition-colors ${styles.navLink} ${isActive ? styles.activeLink : ''}`}
        >
          {item.label}
        </Link>
      </motion.div>
    );
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full backdrop-blur ${
        scrolled ? 'bg-background/95 shadow-md' : 'bg-background/70'
      } transition-all duration-300`}
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo section */}
          <div className="flex-shrink-0 flex items-center">
            <motion.div initial="hidden" animate="visible" variants={logoVariants} className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="w-auto h-10 max-h-[40px] object-contain"
                  priority
                />
                <div className="ml-2 font-bold text-xl">
                  <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-transparent bg-clip-text">
                    Vital-AI
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item, index) => (
              <NavLink key={item.href} item={item} index={index} />
            ))}
          </div>

          {/* Authentication button */}
          <motion.div
            className="hidden md:flex md:items-center md:ml-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            {user?.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-10 relative">
                    <Avatar className="h-8 w-8 text-white">
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-cyan-500">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block">
                      {userProfile?.full_name || user.email?.split('@')[0] || 'Profile'}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{userProfile?.full_name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex w-full cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild={true} variant={'secondary'} className="relative overflow-hidden group">
                <Link href={'/login'}>
                  <span className="relative z-10">Sign in</span>
                  <span
                    className={`${styles.buttonGlow} absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                  ></span>
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <motion.div
            className="md:hidden flex items-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {/* Authentication button for mobile */}
            {user?.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Avatar className="h-8 w-8 text-white">
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-cyan-500">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{userProfile?.full_name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex w-full cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild={true} variant={'secondary'} size="sm" className="relative overflow-hidden group">
                <Link href={'/login'}>
                  <span className="relative z-10">Sign in</span>
                  <span
                    className={`${styles.buttonGlow} absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                  ></span>
                </Link>
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
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden overflow-hidden"
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  className="block py-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.2 }}
                >
                  {item.dropdownItems ? (
                    <div className="space-y-2">
                      <div className="px-3 text-sm font-medium text-foreground/70">{item.label}</div>
                      {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                        <motion.div
                          key={dropdownItem.href}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + dropdownIndex * 0.03, duration: 0.2 }}
                        >
                          <Link
                            href={dropdownItem.href}
                            className={`block px-3 py-2 text-base font-medium rounded-md ${
                              styles.navLink
                            } ${pathname === dropdownItem.href ? styles.activeLink : ''}`}
                            onClick={() => setIsOpen(false)}
                          >
                            {dropdownItem.label}
                          </Link>
                        </motion.div>
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
