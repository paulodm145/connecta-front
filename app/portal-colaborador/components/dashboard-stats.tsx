import { Card, CardContent } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, BarChart3 } from "lucide-react"

const stats = [
  {
    title: "À responder",
    value: "2",
    icon: FileText,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  {
    title: "Respondidos",
    value: "2",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    highlighted: true,
  },
  {
    title: "Fechados",
    value: "2",
    icon: XCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  {
    title: "Total",
    value: "2",
    icon: BarChart3,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`${stat.highlighted ? "ring-2 ring-blue-200" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.highlighted ? "text-blue-600" : "text-gray-900"}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
