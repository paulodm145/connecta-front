"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ActionModal() {
  const [date, setDate] = useState<Date>()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Nova Ação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px] w-11/12">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nova Ação</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Planejamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planejamento">Planejamento</SelectItem>
              {/* Add more options as needed */}
            </SelectContent>
          </Select>
          <div className="grid gap-2">
            <Label htmlFor="what" className="sr-only">O quê?</Label>
            <Input id="what" placeholder="O quê?" className="text-lg" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="how" className="sr-only">Como?</Label>
            <Textarea id="how" placeholder="Como?" className="min-h-[100px] text-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="who" className="sr-only">Quem?</Label>
              <Input id="who" placeholder="Quem?" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="approver" className="sr-only">Quem aprova?</Label>
              <Input id="approver" placeholder="Quem aprova?" />
            </div>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Quando</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline">Cancelar</Button>
          <Button className="bg-green-600 hover:bg-green-700">Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}