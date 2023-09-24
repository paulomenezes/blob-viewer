'use client';

export default function Example() {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600">Error</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Vercel Blob token not found in .env file</h1>
        <p className="mt-6 text-base leading-7 text-gray-600">Please add the Vercel Blob token to your .env file.</p>
      </div>
    </main>
  );
}
