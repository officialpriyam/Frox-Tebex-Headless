import { useQuery } from "@tanstack/react-query";
import type { SiteSettings, SocialLink, PageSetting, SeasonalTheme, Page } from "@data/schema";

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });
}

export function useSocialLinks() {
  return useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });
}

export function usePageSettings() {
  return useQuery<PageSetting[]>({
    queryKey: ["/api/page-settings"],
  });
}

export function useSeasonalThemes() {
  return useQuery<SeasonalTheme[]>({
    queryKey: ["/api/seasonal-themes"],
  });
}

export function useActiveSeasonalTheme() {
  const { data: settings } = useSiteSettings();
  const { data: themes } = useSeasonalThemes();

  if (!settings?.activeSeasonalTheme || settings.activeSeasonalTheme === "none") {
    return null;
  }

  const activeTheme = themes?.find((t) => t.id === settings.activeSeasonalTheme);
  if (!activeTheme) {
    return { id: settings.activeSeasonalTheme, name: settings.activeSeasonalTheme, enabled: true, settings: {} };
  }

  return activeTheme;
}
export function useCustomPages() {
  return useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });
}
