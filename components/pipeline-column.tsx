"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DealCard } from "@/components/deal-card"
import type { Deal, Contact } from "@/lib/cloudflare-kv"

interface PipelineColumnProps {
  title: string
  stage: string
  deals: Deal[]
  contacts: Contact[]
  onEdit: (deal: Deal) => void
  onDelete: (id: string) => void
  onDrop: (dealId: string, newStage: string) => void
}

export function PipelineColumn({ title, stage, deals, contacts, onEdit, onDelete, onDrop }: PipelineColumnProps) {
  const stageDeals = deals.filter((deal) => deal.stage === stage)
  const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData("dealId")
    if (dealId) {
      onDrop(dealId, stage)
    }
  }

  return (
    <div className="flex-shrink-0 w-80" onDragOver={handleDragOver} onDrop={handleDrop}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
          </div>
          <p className="text-xs font-medium text-muted-foreground mt-1">{formatCurrency(totalValue)}</p>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3 pt-0">
          {stageDeals.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Henüz fırsat yok</p>
          ) : (
            stageDeals.map((deal) => (
              <div
                key={deal.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("dealId", deal.id)
                }}
              >
                <DealCard
                  deal={deal}
                  contact={contacts.find((c) => c.id === deal.contactId)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
