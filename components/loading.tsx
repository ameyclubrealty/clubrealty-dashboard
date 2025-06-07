import { Spinner } from "@/components/ui/spinner"

export function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Spinner />
    </div>
  )
}
