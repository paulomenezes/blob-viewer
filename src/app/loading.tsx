import { Input } from '@/components/ui/input';
import { SearchIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePageLoading() {
  return (
    <div>
      <div className="bg-gray-800 px-4 md:px-6 shadow sticky top-0">
        <div className="relative flex h-14 items-center justify-between">
          <div className="lg:flex items-center pr-2 lg:px-0">
            <div className="flex gap-2">
              <Button className="bg-gray-700 hover:bg-gray-900" type="button" disabled>
                <span className="hidden md:block">Upload File</span>
                <Upload className="w-4 md:ml-2" />
              </Button>
            </div>
          </div>
          <div className="flex flex-1 justify-center lg:ml-6 lg:justify-end">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <Input
                  placeholder="Search files"
                  className="bg-gray-700 focus:bg-white border-0 placeholder:text-gray-400 pl-10 text-white focus:text-gray-900"
                  disabled
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div role="list" className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 p-4 md:p-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <FileCard key={index} />
        ))}
      </div>
    </div>
  );
}

function FileCard() {
  return (
    <div className={cn('col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow hover:shadow-md text-left', {})}>
      <div className="flex w-full items-center space-x-4 md:space-x-6 p-4 md:p-6">
        <div className="w-8 md:w-11 h-8 md:h-11 flex-shrink-0">
          <Skeleton className="w-full h-full rounded" />
        </div>

        <div className="flex-1 truncate">
          <div className="flex items-center space-x-1 md:space-x-3">
            <h3 className="truncate text-xs md:text-sm font-medium text-gray-900">
              <Skeleton className="w-[100px] h-5 rounded" />
            </h3>
            <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] md:text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 animate-pulse w-[65px] h-5"></span>
          </div>
          <p className="mt-1 truncate text-xs md:text-sm text-gray-500">
            <Skeleton className="w-[90px] h-4 rounded" />
          </p>
        </div>
      </div>
    </div>
  );
}
