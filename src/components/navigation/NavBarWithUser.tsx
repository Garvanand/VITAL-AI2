'use client';

import { useUser } from '@/contexts/UserContext';
import NavBar from './NavBar';

interface NavBarWithUserProps {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}

export default function NavBarWithUser({ logo }: NavBarWithUserProps) {
  const { user } = useUser();

  return <NavBar logo={logo} user={user} />;
}
