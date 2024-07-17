import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      Nothing to see here. If you&apos;re looking for the home page, please
      click{' '}
      <Link href="https://upsurge.bot" className="text-purple-5">
        here.
      </Link>
    </main>
  );
}
