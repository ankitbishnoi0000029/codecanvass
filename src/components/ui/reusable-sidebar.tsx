'use client';

import { ReactNode } from 'react';
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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';

export interface SidebarOption {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  keyword?: string;
  onClick?: () => void;
  urlName?: string;
}

export interface ReusableSidebarProps {
  title: string;
  icon: LucideIcon;
  options: SidebarOption[];
  selectedOption: string;
  onOptionSelect: (optionId: string) => void;
  footerOptions?: SidebarOption[];
  children: ReactNode;
  className?: string;
}

export function ReusableSidebar({
  title,
  icon: Icon,
  options,
  selectedOption,
  onOptionSelect,
  footerOptions = [],
  children,
  className = '',
}: ReusableSidebarProps) {
  console.log(selectedOption);
  return (
    <SidebarProvider>
      <div className={`flex w-screen ${className}`}>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <Icon className="h-6 w-6" />
              <span className="font-bold ">{title}</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Options</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {options.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <SidebarMenuItem key={option.id}>
                        <SidebarMenuButton
                          isActive={selectedOption === option.id}
                          onClick={() => {
                            onOptionSelect(option.id);
                            option.onClick?.();
                          }}
                          className={`w-full justify-start uppercase cursor-pointer ${selectedOption == option.id ? 'bg-blue-700 font-extrabold ' : ''}`}
                        >
                          <OptionIcon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {footerOptions.length > 0 && (
            <SidebarFooter>
              <SidebarMenu>
                {footerOptions.map((option) => {
                  const OptionIcon = option.icon;
                  return (
                    <SidebarMenuItem key={option.id}>
                      <SidebarMenuButton
                        onClick={option.onClick}
                        className="w-full justify-start uppercase"
                      >
                        <OptionIcon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarFooter>
          )}
        </Sidebar>

        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export interface SidebarContentProps {
  selectedOption: SidebarOption | undefined;
  children?: ReactNode;
  className?: string;
}

export function SidebarContentWrapper({
  selectedOption,
  children,
  className = '',
}: SidebarContentProps) {
  return (
    <div className={`flex w-full pt-8 border-t-2 border-amber-800 top-2 flex-col ${className}`}>
      {/* HEADER */}
      <div className="flex h-18 items-center justify-between gap-3 border-b px-5">
        <div className="flex items-center gap-3">
          <SidebarTrigger />

          <h1 className="text-3xl font-extrabold uppercase tracking-wide">
            {selectedOption?.label || selectedOption?.urlName}
          </h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 ">{children}</div>
    </div>
  );
}
