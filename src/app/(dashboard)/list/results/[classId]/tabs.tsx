'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TabsProps {
  classId: string;
  className?: string;
}

const Tabs = ({ classId, className }: TabsProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Ujian',
      href: `/list/results/${classId}/exam`,
    },
    {
      name: 'Tugas',
      href: `/list/results/${classId}/assignment`,
    },
  ];

  return (
    <div className={cn('flex space-x-4 border-b', className)}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <button
            key={tab.name}
            onClick={() => router.push(tab.href)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs; 