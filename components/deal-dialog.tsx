"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Deal, Contact } from "@/lib/cloudflare-kv"

interface DealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal?: Deal | null
  contacts: Contact[]
  onSave: (deal: Partial<Deal>) => void
}

const STAGES = [
  { value: "lead", label: "Potansiyel" },
  { value: "qualified", label: "Nitelikli" },
  { value: "proposal", label: "Teklif" },
  { value: "negotiation", label: "Pazarlık" },
  { value: "won", label: "Kazanıldı" },
  { value: "lost", label: "Kaybedildi" },
]

export function DealDialog({ open, onOpenChange, deal, contacts, onSave }: DealDialogProps) {
  type FormState = {
    title: string
    value: string
    contactId: string
    stage: Deal["stage"]
    description: string
  }

  const [formData, setFormData] = useState<FormState>({
    title: deal?.title ?? "",
    value: deal?.value?.toString() ?? "",
    contactId: deal?.contactId ?? "",
    stage: deal?.stage ?? "lead",
    description: deal?.description ?? "",
  })

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        value: deal.value.toString(),
        contactId: deal.contactId ?? "",
        stage: deal.stage,
        description: deal.description ?? "",
      })
    } else {
      setFormData({
        title: "",
        value: "",
        contactId: "",
        stage: "lead",
        description: "",
      })
    }
  }, [deal, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      value: Number.parseFloat(formData.value),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{deal ? "Fırsatı Düzenle" : "Yeni Fırsat Ekle"}</DialogTitle>
            <DialogDescription>
              {deal ? "Fırsat bilgilerini güncelleyin." : "Yeni bir satış fırsatı eklemek için bilgileri doldurun."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Yeni proje fırsatı"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Değer (TRY)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="50000"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">Kişi</Label>
              <Select
                value={formData.contactId}
                onValueChange={(value) => setFormData({ ...formData, contactId: value })}
                required
              >
                <SelectTrigger id="contact">
                  <SelectValue placeholder="Kişi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} - {contact.company || contact.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage">Aşama</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value as Deal["stage"] })}
              >
                <SelectTrigger id="stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Fırsat detayları..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
