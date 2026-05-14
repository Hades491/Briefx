import { Skeleton } from '@/components/ui/skeleton'

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end">
        <div className="bg-primary/10 rounded-lg rounded-br-none p-3 max-w-xs">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-muted rounded-lg rounded-bl-none p-3 max-w-xs">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="bg-primary/10 rounded-lg rounded-br-none p-3 max-w-xs">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-card rounded-lg p-6 border">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ConversationSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-3 rounded-lg border bg-card">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32 mt-2" />
        </div>
      ))}
    </div>
  )
}
