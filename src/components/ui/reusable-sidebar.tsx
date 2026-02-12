"use client"

import { ReactNode } from "react"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar"
import { LucideIcon } from "lucide-react"

export interface SidebarOption {
  id: string
  label: string
  icon: LucideIcon
  description?: string
  keyword? : string
  onClick?: () => void
}

export interface ReusableSidebarProps {
  title: string
  icon: LucideIcon
  options: SidebarOption[]
  selectedOption: string
  onOptionSelect: (optionId: string) => void
  footerOptions?: SidebarOption[]
  children: ReactNode
  className?: string
}

export function ReusableSidebar({
  title,
  icon: Icon,
  options,
  selectedOption,
  onOptionSelect,
  footerOptions = [],
  children,
  className = ""
}: ReusableSidebarProps) {
  return (
    <SidebarProvider>
      <div className={`flex h-screen w-screen ${className}`}>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <Icon className="h-6 w-6" />
              <span className="font-semibold">{title}</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Options</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {options.map((option) => {
                    const OptionIcon = option.icon
                    return (
                      <SidebarMenuItem key={option.id}>
                        <SidebarMenuButton
                          isActive={selectedOption === option.id}
                          onClick={() => {
                            onOptionSelect(option.id)
                            option.onClick?.()
                          }}
                          className="w-full justify-start"
                        >
                          <OptionIcon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          {footerOptions.length > 0 && (
            <SidebarFooter>
              <SidebarMenu>
                {footerOptions.map((option) => {
                  const OptionIcon = option.icon
                  return (
                    <SidebarMenuItem key={option.id}>
                      <SidebarMenuButton
                        onClick={option.onClick}
                        className="w-full justify-start"
                      >
                        <OptionIcon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarFooter>
          )}
        </Sidebar>
        
        <SidebarInset>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export interface SidebarContentProps {
  selectedOption: SidebarOption | undefined
  children?: ReactNode
  className?: string
}

export function SidebarContentWrapper({ 
  selectedOption, 
  children, 
  className = "" 
}: SidebarContentProps) {
  return (
    <div className={`flex w-full h-full flex-col ${className}`}>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">
          {selectedOption?.label}
        </h1>
      </header>
      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
