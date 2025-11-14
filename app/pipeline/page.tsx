"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PipelineColumn } from "@/components/pipeline-column"
import { DealDialog } from "@/components/deal-dialog"
import type { Deal, Contact } from "@/lib/cloudflare-kv"
import { parseJsonResponse } from "@/lib/utils"

const STAGES: { id: Deal["stage"]; title: string }[] = [
  { id: "lead",        title: "Lead" },
  { id: "qualified",   title: "Nitelikli" },
  { id: "proposal",    title: "Teklif" },
  { id: "negotiation", title: "Pazarlık" },
  { id: "won",         title: "Kazanıldı" },
  { id: "lost",        title: "Kaybedildi" },
]

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

  // --------------------------------------------------
  // İlk yüklemede tüm fırsatları ve kişileri çek
  // --------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [dealsRes, contactsRes] = await Promise.all([
          fetch("/api/deals"),
          fetch("/api/contacts"),
        ])

        const dealsData = await parseJsonResponse<Deal[]>(dealsRes)
        const contactsData = await parseJsonResponse<Contact[]>(contactsRes)

        setDeals(dealsData ?? [])
        setContacts(contactsData ?? [])
      } catch (err) {
        console.error("Error loading pipeline data:", err)
        setError("Veriler yüklenirken bir hata oluştu.")
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  // --------------------------------------------------
  // Drag & drop ile stage değiştirme
  // --------------------------------------------------
  const handleDrop = async (dealId: string, newStage: Deal["stage"]) => {
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === dealId
          ? {
            ...deal,
            stage: newStage,
            updatedAt: new Date().toISOString(),
          }
          : deal,
      ),
    )

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Failed to update deal stage:", text)
        throw new Error(text || "Stage güncellenemedi")
      }
    } catch (err) {
      console.error("Error updating deal stage:", err)
      // Optimistic update geri alma (isteğe bağlı)
    }
  }

  // --------------------------------------------------
  // Dialog aç / kapat
  // --------------------------------------------------
  const handleDialogOpenNew = () => {
    setEditingDeal(null)
    setDialogOpen(true)
  }

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal)
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingDeal(null)
    }
    setDialogOpen(open)
  }

  // --------------------------------------------------
  // Yeni fırsat kaydetme / mevcut fırsatı güncelleme
  // --------------------------------------------------
  const handleSave = async (
    data: Omit<Deal, "id" | "createdAt" | "updatedAt">,
    id?: string,
  ) => {
    try {
      if (id) {
        // UPDATE
        const res = await fetch(`/api/deals/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const updated = await parseJsonResponse<Deal>(res)

        setDeals((prev) =>
          prev.map((deal) => (deal.id === updated.id ? updated : deal)),
        )
      } else {
        // CREATE
        const res = await fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const created = await parseJsonResponse<Deal>(res)
        setDeals((prev) => [...prev, created])
      }
    } catch (err) {
      console.error("Error saving deal:", err)
      alert("Fırsat kaydedilirken bir hata oluştu.")
    } finally {
      setDialogOpen(false)
      setEditingDeal(null)
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Satış Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Fırsatları aşamalara göre takip edin.
          </p>
        </div>

        <Button onClick={handleDialogOpenNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Fırsat
        </Button>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 gap-4 overflow-x-auto px-4 py-4">
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage.id}
              title={stage.title}
              deals={deals.filter((deal) => deal.stage === stage.id)}
              contacts={contacts}
              onDropDeal={handleDrop}
              onEditDeal={handleEditDeal}
            />
          ))}
        </div>

        <DealDialog
          open={dialogOpen}
          onOpenChange={handleDialogChange}
          deal={editingDeal}
          contacts={contacts}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
