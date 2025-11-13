"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, DollarSign, Target } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-16 px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4 text-balance">Modern CRM Sistemi</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Müşteri ilişkilerinizi yönetin, satış fırsatlarınızı takip edin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/contacts")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Kişiler</CardTitle>
                  <CardDescription>Müşterilerinizi yönetin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tüm kişi bilgilerinizi tek bir yerde toplayın ve yönetin</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/pipeline")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Satış Hunisi</CardTitle>
                  <CardDescription>Fırsatlarınızı takip edin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pipedrive tarzı kanban board ile satış sürecinizi görselleştirin
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Aktif Fırsat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Toplam Kişi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">₺0</p>
                  <p className="text-xs text-muted-foreground">Toplam Değer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="flex gap-4 justify-center">
            <Link href="/contacts">
              <Button size="lg">
                <Users className="mr-2 h-5 w-5" />
                Kişilere Git
              </Button>
            </Link>
            <Link href="/pipeline">
              <Button size="lg" variant="outline">
                <TrendingUp className="mr-2 h-5 w-5" />
                Satış Hunisi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
