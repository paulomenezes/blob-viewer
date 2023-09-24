import { list } from '@vercel/blob';
import HomePageContent, { Header } from './content';
import { Suspense } from 'react';

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

const encoder = new TextEncoder();

async function* makeIterator() {
  let hasMore = true;
  let cursor;

  const allFiles = [];

  while (hasMore) {
    const listResult = await list({
      limit: 2,

      cursor,
    });

    allFiles.push(...listResult.blobs);

    yield encoder.encode(JSON.stringify(listResult.blobs));

    hasMore = listResult.hasMore;
    cursor = listResult.cursor;
  }
}

export default async function HomePage() {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);

  return (
    <>
      <Header />
      <Suspense fallback={<div>loading...</div>}>
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 p-6">
          <Reader reader={stream.getReader()} />
        </ul>
      </Suspense>
    </>
  );
}

async function Reader({ reader }: { reader: ReadableStreamDefaultReader<any> }) {
  const { done, value } = await reader.read();

  if (done) {
    return null;
  }

  const text = new TextDecoder().decode(value);

  return (
    <>
      <HomePageContent files={JSON.parse(text)} />
      <Suspense>
        <Reader reader={reader} />
      </Suspense>
    </>
  );
}
