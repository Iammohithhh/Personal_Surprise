'use client';

import { useStore } from '@/store/useStore';
import Landing from '@/components/Landing';
import CreateStory from '@/components/CreateStory';
import Preview from '@/components/Preview';
import Experience from '@/components/Experience';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { viewMode } = useStore();

  return (
    <main>
      {viewMode === 'landing' && <Landing />}
      {viewMode === 'create' && <CreateStory />}
      {viewMode === 'preview' && <Preview />}
      {viewMode === 'experience' && <Experience />}
      {viewMode === 'dashboard' && <Dashboard />}
    </main>
  );
}
