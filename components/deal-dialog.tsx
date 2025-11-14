"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { Deal, Contact } from "@/lib/cloudflare-kv"

type DealFormState = {
  title: string
  value: number
  contactId: string
  stage: Deal["stage"]
  description: string
}

interface DealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal | null
  contacts: Contact[]
  onSave: (data: Omit<Deal, "id" | "createdAt" | "updatedAt">, id?: string) => Promise<void> | void
}

const EMPTY_FORM: DealFormState = {
  title: "",
  value: 0,
  contactId: "",
  stage: "lead",
  description: "",
}

export function DealDialog({
  open,
  onOpenChange,
  deal,
  contacts,
  onSave,
}: DealDialogProps) {
  const [formData, setFormData] = useState<DealFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Dialog açıldığında veya editlenecek deal değiştiğinde formu doldur
  useEffect(() => {
    if (deal && open) {
      setFormData({
        title: deal.title ?? "",
        value: deal.value ?? 0,
        contactId: deal.contactId ?? "",
        stage: deal.stage ?? "lead",
        description: deal.description ?? "",
      })
    } else if (open && !deal) {
      setFormData(EMPTY_FORM)
    }
  }, [deal, open])

  const handleChange =
    (field: keyof DealFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "value" ? Number(event.target.value || 0) : event.target.value

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Kişi seçilmeden kaydetmeye çalışma
    if (!formData.contactId) {
      alert("Lütfen bir kişi seçin.")
      return
    }

    try {
      setSaving(true)

      const payload: Omit<Deal, "id" | "createdAt" | "updatedAt"> = {
        title: formData.title,
        value: Number.isFinite(formData.value) ? formData.value : 0,
        contactId: formData.contactId,
        stage: formData.stage,
        description: formData.description,
      }

      await onSave(payload, deal?.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving deal:", error)
      alert("Fırsat kaydedilirken bir hata oluştu.")
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFormData(EMPTY_FORM)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>{deal ? "Fırsatı Düzenle" : "Yeni Fırsat"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleChange("title")}
                placeholder="Örn. Synora Retinol Kampanyası"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Değer (₺)</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value === 0 ? "" : formData.value}
                  onChange={handleChange("value")}
                  placeholder="Örn. 25.000"
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label>Kişi</Label>
                <Select
                  value={formData.contactId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, contactId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        contacts.length === 0
                          ? "Kişi yok, önce kişi ekleyin"
                          : "Bir kişi seçin"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.length === 0 ? (
                      <SelectItem value="__no_contact" disabled>
                        Kayıtlı kişi yok
                      </SelectItem>
                    ) : (
                      contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                          {contact.company ? ` — ${contact.company}` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aşama</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    stage: value as Deal["stage"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bir aşama seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Nitelikli</SelectItem>
                  <SelectItem value="proposal">Teklif</SelectItem>
                  <SelectItem value="negotiation">Pazarlık</SelectItem>
                  <SelectItem value="won">Kazanıldı</SelectItem>
                  <SelectItem value="lost">Kaybedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Notlar</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange("description")}
                placeholder="Bu fırsatla ilgili önemli notlar..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={saving || contacts.length === 0}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deal ? "Kaydet" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
