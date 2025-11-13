"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2, User } from "lucide-react"
import type { Deal, Contact } from "@/lib/cloudflare-kv"

interface DealCardProps {
  deal: Deal
  contact?: Contact
  onEdit: (deal: Deal) => void
  onDelete: (id: string) => void
}

export function DealCard({ deal, contact, onEdit, onDelete }: DealCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value)
  }

  return (
    <Card className="cursor-move hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold leading-tight">{deal.title}</CardTitle>
            {contact && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <User className="h-3 w-3" />
                {contact.name}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(deal)}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(deal.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="font-semibold">
            {formatCurrency(deal.value)}
          </Badge>
        </div>
        {deal.description && <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{deal.description}</p>}
      </CardContent>
    </Card>
  )
}
