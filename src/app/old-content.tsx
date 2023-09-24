'use client';

import { Input } from '@/components/ui/input';
import { type PutBlobResult } from '@vercel/blob';
import { useState, useRef, useMemo } from 'react';
import { ArrowDown01Icon, ArrowDownAzIcon, ArrowDownWideNarrow, ArrowUp01Icon, ArrowUpAzIcon, ArrowUpWideNarrow, SearchIcon } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { FileIcon, defaultStyles } from 'react-file-icon';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import path from 'path';
import { ListBlobResultBlob } from '@/types/blob';
import { formatDistanceToNow } from 'date-fns';

export default function HomePageContent({ files }: { files: ListBlobResultBlob[] }) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  const [sortBy, setSortBy] = useState('name-asc');

  const extensions = useMemo(() => [...new Set(files.map((blob) => path.extname(blob.pathname)))], [files]);

  const [selectedExtensions, setSelectedExtensions] = useState<Record<string, boolean>>({});

  const isAllSelected = useMemo(
    () =>
      Object.keys(selectedExtensions).length === 0 ||
      (extensions.length === Object.values(selectedExtensions).length && Object.values(selectedExtensions).every((value) => value)) ||
      (extensions.length === Object.values(selectedExtensions).length && Object.values(selectedExtensions).every((value) => !value)),
    [selectedExtensions]
  );

  const selectedExtensionString = useMemo(() => {
    const all = Object.entries(selectedExtensions)
      .filter(([, isSelected]) => isSelected)
      .map(([extension]) => extension);

    const partial = all.slice(0, 3);

    return `${partial.join(', ')}${partial.length < all.length ? ` +${all.length - partial.length}` : ''}`;
  }, [selectedExtensions]);

  const sortedFiles = useMemo(
    () =>
      [...files].sort((a, b) => {
        if (sortBy === 'name-asc') {
          return a.pathname.localeCompare(b.pathname);
        }

        if (sortBy === 'name-desc') {
          return b.pathname.localeCompare(a.pathname);
        }

        if (sortBy === 'size-asc') {
          return a.size - b.size;
        }

        if (sortBy === 'size-desc') {
          return b.size - a.size;
        }

        if (sortBy === 'date-asc') {
          return a.uploadedAt.getTime() - b.uploadedAt.getTime();
        }

        if (sortBy === 'date-desc') {
          return b.uploadedAt.getTime() - a.uploadedAt.getTime();
        }

        return 0;
      }),
    [files, sortBy]
  );

  const filteredFiles = useMemo(() => {
    if (isAllSelected) {
      return sortedFiles;
    }

    return sortedFiles.filter((blob) => {
      const extension = path.extname(blob.pathname);

      return selectedExtensions[extension];
    });
  }, [sortedFiles, selectedExtensions]);

  return (
    <div>
      <div className="bg-gray-800 px-6 shadow sticky top-0">
        <div className="relative flex h-14 items-center justify-between">
          <div className="lg:flex items-center px-2 lg:px-0 hidden">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="bg-gray-700 border-0 text-white hover:bg-gray-900 hover:text-white">
                  <Button variant="outline">{isAllSelected ? 'All extensions' : selectedExtensionString}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuCheckboxItem
                    checked={isAllSelected}
                    onCheckedChange={() => {
                      const newSelectedExtensions = Object.fromEntries(extensions.map((extension) => [extension, !isAllSelected]));

                      setSelectedExtensions(newSelectedExtensions);
                    }}
                  >
                    All extensions
                  </DropdownMenuCheckboxItem>

                  {extensions.map((extension) => (
                    <DropdownMenuCheckboxItem
                      key={extension}
                      checked={selectedExtensions[extension]}
                      onCheckedChange={() => {
                        setSelectedExtensions((selectedExtensions) => ({
                          ...selectedExtensions,
                          [extension]: !selectedExtensions[extension],
                        }));
                      }}
                    >
                      {extension}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild className="bg-gray-700 border-0 text-white hover:bg-gray-900 hover:text-white">
                  <Button variant="outline">Sort by</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuRadioItem value="name-asc">
                      Name
                      <DropdownMenuShortcut>
                        <ArrowDownAzIcon className="w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name-desc">
                      Name
                      <DropdownMenuShortcut>
                        <ArrowUpAzIcon className="w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="size-asc">
                      Size
                      <DropdownMenuShortcut>
                        <ArrowDown01Icon className="w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="size-desc">
                      Size
                      <DropdownMenuShortcut>
                        <ArrowUp01Icon className="w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date-asc">
                      Date
                      <DropdownMenuShortcut>
                        <ArrowDownWideNarrow className="w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date-desc">
                      Date
                      <DropdownMenuShortcut>
                        <ArrowUpWideNarrow className="w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex flex-1 justify-center lg:ml-6 lg:justify-end">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <Input placeholder="Search files" className="bg-gray-700 focus:bg-white border-0 placeholder:text-gray-400 pl-10" />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 p-6">
        {filteredFiles.map((blob) => {
          const extension = path.extname(blob.pathname);

          return (
            <li key={blob.url} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
              <div className="flex w-full items-center space-x-6 p-6">
                <div className="w-10 h-10 flex-shrink-0">
                  <FileIcon extension={extension} {...defaultStyles[extension.replace('.', '')]} />
                </div>

                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <h3 className="truncate text-sm font-medium text-gray-900">{blob.pathname}</h3>
                    <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {formatBytes(blob.size)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {formatDistanceToNow(blob.uploadedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          event.stopPropagation();

          const file = inputFileRef.current.files[0];

          const response = await fetch(`/api/avatar/upload?filename=${file.name}`, {
            method: 'POST',
            body: file,
          });

          const newBlob = (await response.json()) as PutBlobResult;

          setBlob(newBlob);
        }}
      >
        <input name="file" ref={inputFileRef} type="file" required />
        <button type="submit">Upload</button>
      </form>
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </div>
  );
}
