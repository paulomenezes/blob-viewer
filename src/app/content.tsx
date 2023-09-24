'use client';

import { Input } from '@/components/ui/input';
import { useState, useMemo, useTransition } from 'react';
import { Copy, Download, FilesIcon, SearchIcon, Trash, Upload, XCircle } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { Button } from '@/components/ui/button';
import path from 'path';
import { ListBlobResultBlob } from '@/types/blob';
import { format, formatDistanceToNow } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HeadBlobResult } from '@vercel/blob';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePageContent({ files }: { files: ListBlobResultBlob[] }) {
  const { toast } = useToast();
  const [uploadedBlobs, setUploadBlobs] = useState<ListBlobResultBlob[]>([]);

  const [query, setQuery] = useState('');

  const { open } = useDropzone({
    async onDrop(acceptedFiles) {
      setUploadBlobs((prev) => [
        ...acceptedFiles.map((file) => ({
          pathname: file.name,
          size: file.size,
          uploadedAt: new Date(),
        })),
        ...prev,
      ]);

      for (let index = 0; index < acceptedFiles.length; index++) {
        const file = acceptedFiles[index];

        try {
          const response = await fetch(`/api/avatar/upload?filename=${file.name}`, {
            method: 'POST',
            body: file,
          });

          toast({
            title: 'File uploaded.',
            description: `The file "${file.name}" has been uploaded.`,
          });

          const json = await response.json();

          setUploadBlobs((prev) =>
            prev.map((blob) =>
              blob.pathname === file.name
                ? {
                    ...blob,
                    url: json.url,
                  }
                : blob
            )
          );
        } catch {
          toast({
            title: 'Uh oh! Something went wrong.',
            description: `We were unable to upload "${file.name}".`,
            variant: 'destructive',
          });

          setUploadBlobs((prev) => prev.filter((blob) => blob.pathname !== file.name));
        }
      }
    },
  });

  const allFiles = useMemo(
    () =>
      [...uploadedBlobs, ...files]
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
        .filter((blob) => blob.pathname.toLowerCase().includes(query.trim().toLowerCase())),
    [uploadedBlobs, files, query]
  );

  return (
    <div>
      <div className="bg-gray-800 px-4 md:px-6 shadow sticky top-0">
        <div className="relative flex h-14 items-center justify-between">
          <div className="lg:flex items-center pr-2 lg:px-0">
            <div className="flex gap-2">
              <Button className="bg-gray-700 hover:bg-gray-900" type="button" onClick={open}>
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
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {allFiles.length === 0 ? (
        <div className="text-center mt-12">
          <FilesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No files found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {query.trim() === '' ? 'Upload a file by clicking the button below.' : 'Try changing your search query.'}
          </p>
          <div className="mt-6 flex flex-col gap-4 items-center">
            <Button className="bg-gray-700 hover:bg-gray-900" type="button" onClick={open}>
              Upload File
              <Upload className="w-4 ml-2" />
            </Button>

            {query.trim().length !== 0 && (
              <Button variant="outline" type="button" onClick={() => setQuery('')}>
                Clear Search
                <XCircle className="w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div role="list" className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 p-4 md:p-6">
          {allFiles.map((blob) => (
            <FileCard key={blob.url ?? blob.pathname} blob={blob} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileCard({ blob }: { blob: ListBlobResultBlob }) {
  const extension = path.extname(blob.pathname);
  const styles = defaultStyles[extension.replace('.', '') as keyof typeof defaultStyles];

  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();
  const [isLoading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  const [isLoadingDetail, setLoadingDetail] = useState(false);
  const [fileDetail, setFileDetail] = useState<HeadBlobResult | null>(null);

  return (
    <Sheet open={showSheet} onOpenChange={setShowSheet}>
      <SheetTrigger asChild>
        <button
          type="button"
          disabled={isLoading || isPending}
          className={cn('col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow hover:shadow-md text-left', {
            'outline-blue-500 outline animate-pulse': !blob.url || isLoading || isPending,
          })}
          onClick={async () => {
            if (blob.url) {
              setLoadingDetail(true);

              try {
                const request = await fetch(`/api/detail`, {
                  method: 'POST',
                  body: JSON.stringify({
                    url: blob.url,
                  }),
                });

                const response = (await request.json()) as HeadBlobResult | null;

                setFileDetail(response);
                setLoadingDetail(false);
              } catch {
                setLoadingDetail(false);

                toast({
                  title: 'Uh oh! Something went wrong.',
                  description: 'We were unable to fetch the file details.',
                  variant: 'destructive',
                });
              }
            }
          }}
        >
          <div className="flex w-full items-center space-x-4 md:space-x-6 p-4 md:p-6">
            <div className="w-8 md:w-10 h-8 md:h-10 flex-shrink-0">
              <FileIcon extension={extension} {...styles} />
            </div>

            <div className="flex-1 truncate">
              <div className="flex items-center space-x-1 md:space-x-3">
                <h3 className="truncate text-xs md:text-sm font-medium text-gray-900">{blob.pathname}</h3>
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] md:text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {formatBytes(blob.size)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs md:text-sm text-gray-500">
                {formatDistanceToNow(blob.uploadedAt, {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </button>
      </SheetTrigger>
      <SheetContent>
        <div className="h-full overflow-auto p-6">
          {blob.url && (blob.url.match(/\.(jpeg|jpg|gif|png|svg)$/) || (fileDetail && fileDetail.contentType === 'image/png')) && (
            <div className="w-full h-44 rounded my-4 border border-gray-200 flex justify-center items-center transparent">
              <img src={blob.url} alt={blob.pathname} className="max-w-full max-h-full" />
            </div>
          )}

          <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 flex-shrink-0">
              <FileIcon extension={extension} {...styles} />
            </div>

            <SheetTitle className="flex-1 break-all text-left">{blob.pathname}</SheetTitle>
          </div>
          <div>
            <div className="flex gap-2">
              <a href={blob.url} target="_blank" rel="noopener noreferrer" download>
                <Button type="button">
                  Download
                  <Download className="w-4 ml-2" />
                </Button>
              </a>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-destructive text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    disabled={!blob.url}
                  >
                    Delete
                    <Trash className="w-4 ml-2" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the file &quot;{blob.pathname}&quot;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        setShowSheet(false);
                        setLoading(true);

                        try {
                          await fetch(`/api/delete`, {
                            method: 'POST',
                            body: JSON.stringify({
                              url: blob.url,
                            }),
                          });

                          setLoading(false);

                          toast({
                            title: 'File deleted.',
                          });

                          startTransition(() => {
                            router.refresh();
                          });
                        } catch {
                          setLoading(false);

                          toast({
                            title: 'Uh oh! Something went wrong.',
                            description: 'We were unable to delete the file.',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex flex-col mt-8 text-sm text-gray-700">
              <span className="font-medium">Size</span>
              <span>{formatBytes(blob.size)}</span>
            </div>

            <div className="flex flex-col mt-4 text-sm text-gray-700">
              <span className="font-medium">Updated</span>
              <span>{format(blob.uploadedAt, 'MMMM dd, yyyy, HH:mm')}</span>
            </div>

            {blob.url && (
              <>
                <div className="flex flex-col mt-4 text-sm text-gray-700">
                  <span className="font-medium">URL</span>
                  <div className="flex justify-between items-center">
                    <span className="truncate">
                      <a href={blob.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {blob.url}
                      </a>
                    </span>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          onClick={() => {
                            navigator.clipboard.writeText(blob.url ?? '');

                            toast({
                              title: 'Copied to clipboard.',
                            });
                          }}
                        >
                          <Copy className="w-4 ml-2 flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy URL to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex flex-col mt-4 text-sm text-gray-700">
                  <span className="font-medium">Content Type</span>
                  <span> {isLoadingDetail ? <Skeleton className="w-[200px] h-[20px] rounded" /> : fileDetail?.contentType}</span>
                </div>

                <div className="flex flex-col mt-4 text-sm text-gray-700">
                  <span className="font-medium">Content Disposition</span>
                  <span> {isLoadingDetail ? <Skeleton className="w-[200px] h-[20px] rounded" /> : fileDetail?.contentDisposition}</span>
                </div>

                <div className="flex flex-col mt-4 text-sm text-gray-700">
                  <span className="font-medium">Cache Control</span>
                  <span> {isLoadingDetail ? <Skeleton className="w-[200px] h-[20px] rounded" /> : fileDetail?.cacheControl}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
