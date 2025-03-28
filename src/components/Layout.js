import Head from 'next/head';

export default function Layout({ children, title = 'Nervala' }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Trading algorithm visualization platform" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {children}
    </div>
  );
} 