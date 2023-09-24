import { list } from '@vercel/blob';
import HomePageContent from './content';

export default async function HomePage() {
  const listResult = await list();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return <HomePageContent files={listResult.blobs} />;
}
