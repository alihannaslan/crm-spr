"use client"

import type { Deal, Contact } from "@/lib/cloudflare-kv"

type PipelineColumnProps = {
  stage: Deal["stage"]
  title: string
  deals: Deal[]
  contacts: Contact[]
  onDropDeal: (dealId: string, newStage: Deal["stage"]) => void
  onEditDeal: (deal: Deal) => void
}

export function PipelineColumn({
  stage,
  title,
  deals,
  contacts,
  onDropDeal,
  onEditDeal,
}: PipelineColumnProps) {
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const dealId = event.dataTransfer.getData("text/plain")
    if (!dealId) return
    onDropDeal(dealId, stage)
  }

  const getContactName = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    return contact?.name ?? "Kişi yok"
  }

  return (
    <div
      className="flex min-w-[260px] flex-1 flex-col rounded-lg bg-muted/40 p-3"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">
          {deals.length} fırsat
        </span>
      </div>

      <div className="flex-1 space-y-2">
        {deals.map((deal) => (
          <button
            key={deal.id}
            type="button"
            draggable
            onDragStart={(event) =>
              event.dataTransfer.setData("text/plain", deal.id)
            }
            onClick={() => onEditDeal(deal)}
            className="w-full rounded-md border bg-background px-3 py-2 text-left shadow-sm transition hover:border-primary/60 hover:shadow"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{deal.title}</span>
              {deal.value ? (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  ₺{deal.value.toLocaleString("tr-TR")}
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {getContactName(deal.contactId)}
            </div>
          </button>
        ))}

        {deals.length === 0 && (
          <div className="rounded-md border border-dashed border-muted-foreground/30 p-3 text-center text-xs text-muted-foreground">
            Bu aşamada fırsat yok
          </div>
        )}
      </div>
    </div>
  )
}
