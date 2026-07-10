import { Tenant } from '@prisma/client';
import { getThemeComponent, DEFAULT_THEME } from '@/lib/themes';

interface SiteRendererProps {
  tenant: Tenant;
}

export function SiteRenderer({ tenant }: SiteRendererProps) {
  const config = tenant.themeConfig as any || {};
  const themeName = config.theme || DEFAULT_THEME;
  const ThemeComponent = getThemeComponent(themeName);
  return <ThemeComponent tenant={tenant} />;
}
