"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ContactDialog } from "@/components/contact-dialog"
import { ContactsTable } from "@/components/contacts-table"
import { Plus } from "lucide-react"
import type { Contact } from "@/lib/cloudflare-kv"
import { parseJsonResponse } from "@/lib/utils"

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const response = await fetch("/api/contacts")
      const data = await parseJsonResponse<Contact[]>(response)
      setContacts(data)
    } catch (error) {
      console.error("[v0] Error loading contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (contactData: Partial<Contact>) => {
    try {
      if (editingContact) {
        const response = await fetch(`/api/contacts/${editingContact.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        })
        const updated = await parseJsonResponse<Contact>(response)
        setContacts(contacts.map((c) => (c.id === updated.id ? updated : c)))
      } else {
        const response = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        })
        const newContact = await parseJsonResponse<Contact>(response)
        setContacts([...contacts, newContact])
      }
      setEditingContact(null)
    } catch (error) {
      console.error("[v0] Error saving contact:", error)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kişiyi silmek istediğinizden emin misiniz?")) return

    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" })
      setContacts(contacts.filter((c) => c.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting contact:", error)
    }
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingContact(null)
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
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Kişiler</h1>
            <p className="text-muted-foreground mt-1">Tüm kişilerinizi yönetin</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kişi
          </Button>
        </div>

        <ContactsTable contacts={contacts} onEdit={handleEdit} onDelete={handleDelete} />

        <ContactDialog
          open={dialogOpen}
          onOpenChange={handleDialogChange}
          contact={editingContact}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
