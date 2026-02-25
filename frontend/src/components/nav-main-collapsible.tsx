import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';

export interface NavCollapsibleSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export interface NavCollapsibleItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavCollapsibleSubItem[];
}

/**
 * Sidebar navigation group that supports collapsible sub-menus.
 *
 * Items with an `items` array render as collapsible sections.
 * Items without `items` render as direct links.
 * A collapsible group auto-opens when any child route is active.
 */
export function NavMainCollapsible({
  items,
  label,
}: {
  items: NavCollapsibleItem[];
  label?: string;
}) {
  const location = useLocation();

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) =>
          item.items?.length ? (
            <CollapsibleNavItem key={item.title} item={item} pathname={location.pathname} />
          ) : (
            <DirectNavItem key={item.title} item={item} pathname={location.pathname} />
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/** A standalone sidebar link (no sub-items). */
function DirectNavItem({ item, pathname }: { item: NavCollapsibleItem; pathname: string }) {
  const isActive = pathname === item.url || pathname.startsWith(item.url + '/');

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
        <Link to={item.url}>
          {item.icon ? <item.icon /> : null}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** A collapsible sidebar group with nested sub-items. */
function CollapsibleNavItem({ item, pathname }: { item: NavCollapsibleItem; pathname: string }) {
  const { isMobile, state } = useSidebar();
  const hasActiveChild = item.items!.some(
    (sub) => pathname === sub.url || pathname.startsWith(sub.url + '/')
  );

  // When sidebar is collapsed to icon-only, render a DropdownMenu so
  // sub-items are accessible via a popover instead of being hidden.
  if (!isMobile && state === 'collapsed') {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={item.title} isActive={hasActiveChild}>
              {item.icon ? <item.icon /> : null}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="min-w-56 rounded-lg">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {item.title}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.items!.map((sub) => {
              const isActive = pathname === sub.url || pathname.startsWith(sub.url + '/');
              return (
                <DropdownMenuItem key={sub.title} asChild>
                  <Link to={sub.url} className={isActive ? 'bg-accent font-medium' : ''}>
                    {sub.icon ? <sub.icon className="mr-2 h-4 w-4" /> : null}
                    <span>{sub.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  // Default: expanded sidebar uses Collapsible with sub-items
  return (
    <Collapsible asChild defaultOpen={hasActiveChild} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon ? <item.icon /> : null}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items!.map((sub) => {
              const isActive = pathname === sub.url || pathname.startsWith(sub.url + '/');
              return (
                <SidebarMenuSubItem key={sub.title}>
                  <SidebarMenuSubButton asChild isActive={isActive}>
                    <Link to={sub.url}>
                      {sub.icon ? <sub.icon /> : null}
                      <span>{sub.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
