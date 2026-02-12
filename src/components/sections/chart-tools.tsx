"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ReusableSidebar, SidebarContentWrapper, SidebarOption } from "@/components/ui/reusable-sidebar"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Palette } from "lucide-react"

export function ChartTools() {
  const [selectedConverter, setSelectedConverter] = useState("")
  const [data, setData] = useState([
    { name: "A", value1: 30, value2: 20 },
    { name: "B", value1: 40, value2: 35 },
    { name: "C", value1: 20, value2: 45 },
    { name: "D", value1: 50, value2: 30 },
    { name: "E", value1: 70, value2: 50 },
  ])

  const converterOptions: SidebarOption[] = [
    {
      id: "line-graph-maker",
      label: "Line Graph Maker",
      icon: FileText,
      description: "Create interactive line graphs to visualize trends over time.",
    },
    {
      id: "bar-graph-maker",
      label: "Bar Graph Maker",
      icon: FileText,
      description: "Generate bar charts to compare data across categories visually.",
    },
    {
      id: "pie-chart-maker",
      label: "Pie Chart Maker",
      icon: FileText,
      description: "Build pie charts to represent proportional data as slices.",
    },
    {
      id: "doughnut-chart-maker",
      label: "Doughnut Chart Maker",
      icon: FileText,
      description: "Create doughnut charts for circular data representation with a hollow center.",
    },
    {
      id: "scatter-plot-maker",
      label: "Scatter Plot Maker",
      icon: FileText,
      description: "Plot data points on X and Y axes to visualize correlations and distributions.",
    },
  ]

  const footerOptions: SidebarOption[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const selectedOption = converterOptions.find((opt) => opt.id === selectedConverter)

  const COLORS = ["#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444"]

  const handleRandomize = () => {
    const newData = data.map((d) => ({
      ...d,
      value1: Math.floor(Math.random() * 80) + 10,
      value2: Math.floor(Math.random() * 80) + 10,
    }))
    setData(newData)
  }

  const renderChart = () => {
    switch (selectedConverter) {
      case "line-graph-maker":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value1" stroke="#4f46e5" />
              <Line type="monotone" dataKey="value2" stroke="#06b6d4" />
            </LineChart>
          </ResponsiveContainer>
        )

      case "bar-graph-maker":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value1" fill="#4f46e5" />
              <Bar dataKey="value2" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie-chart-maker":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value1"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      case "doughnut-chart-maker":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value2"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      case "scatter-plot-maker":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="value1" name="X Value" />
              <YAxis dataKey="value2" name="Y Value" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Points" data={data} fill="#4f46e5" />
            </ScatterChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <p className="text-center text-gray-500">
            Select a chart type from the sidebar to preview.
          </p>
        )
    }
  }

  return (
    <ReusableSidebar
      title="Chart Tools"
      icon={Palette}
      options={converterOptions}
      selectedOption={selectedConverter}
      onOptionSelect={setSelectedConverter}
      footerOptions={footerOptions}
    >
      <SidebarContentWrapper selectedOption={selectedOption}>
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{selectedOption?.label || "Chart Generator"}</h2>
            <p className="text-muted-foreground">
              {selectedOption?.description || "Choose a chart type to get started."}
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white flex flex-col items-center justify-center">
            {renderChart()}
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleRandomize}>Randomize Data</Button>
            <Button variant="outline" onClick={() => setData([])}>
              Clear
            </Button>
          </div>
        </div>
      </SidebarContentWrapper>
    </ReusableSidebar>
  )
}
