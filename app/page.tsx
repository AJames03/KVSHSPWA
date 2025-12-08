'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/app/loading/page'

export default function page() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 1500); // pwede mong baguhin depende sa gusto mo

    return () => clearTimeout(timer);
  }, [router]);

  // Ipakita ang external loading component habang naghihintay
  return <Loading />;
}
