"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PipelineColumn } from "@/components/pipeline-column"
import { DealDialog } from "@/components/deal-dialog"
import { Plus } from "lucide-react"
import type { Deal, Contact } from "@/lib/cloudflare-kv"

const STAGES = [
  { id: "lead", title: "Potansiyel" },
  { id: "qualified", title: "Nitelikli" },
  { id: "proposal", title: "Teklif" },
  { id: "negotiation", title: "Pazarlık" },
  { id: "won", title: "Kazanıldı" },
]

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dealsRes, contactsRes] = await Promise.all([fetch("/api/deals"), fetch("/api/contacts")])
      const [dealsData, contactsData] = await Promise.all([dealsRes.json(), contactsRes.json()])
      setDeals(dealsData)
      setContacts(contactsData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (dealId: string, newStage: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      })
      const updated = await response.json()
      setDeals(deals.map((d) => (d.id === updated.id ? updated : d)))
    } catch (error) {
      console.error("[v0] Error updating deal:", error)
    }
  }

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu fırsatı silmek istediğinizden emin misiniz?")) return

    try {
      await fetch(`/api/deals/${id}`, { method: "DELETE" })
      setDeals(deals.filter((d) => d.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting deal:", error)
    }
  }

  const handleSave = async (dealData: Partial<Deal>) => {
    try {
      if (editingDeal) {
        const response = await fetch(`/api/deals/${editingDeal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dealData),
        })
        const updated = await response.json()
        setDeals(deals.map((d) => (d.id === updated.id ? updated : d)))
      } else {
        const response = await fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dealData),
        })
        const newDeal = await response.json()
        setDeals([...deals, newDeal])
      }
      setEditingDeal(null)
    } catch (error) {
      console.error("[v0] Error saving deal:", error)
    }
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingDeal(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-[1600px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Satış Hunisi</h1>
            <p className="text-muted-foreground mt-1">Fırsatlarınızı takip edin</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Fırsat
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              title={stage.title}
              stage={stage.id}
              deals={deals}
              contacts={contacts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDrop={handleDrop}
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
