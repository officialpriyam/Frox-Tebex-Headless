import type { TebexCategory, TebexPackage, TebexBasket } from "@data/schema";
import { loadConfig } from "./config";
import { getEnvValue } from "./env";

const TEBEX_API_BASE = "https://headless.tebex.io";

interface TebexCommunityGoal {
  id: number;
  name?: string;
  description?: string;
  target?: string;
  current?: string;
  currency_code?: string;
  status?: string;
  repeatable?: boolean;
}

class TebexClient {
  private getPublicToken(): string {
    const config = loadConfig();
    return config.tebex_public_token || "";
  }

  private getPrivateKey(): string {
    const config = loadConfig();
    return config.tebex_private_key || "";
  }

  private getPluginApiKey(): string {
    return getEnvValue("TEBEX_PLUGIN_API_KEY") || "";
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${TEBEX_API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Tebex API error: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`Tebex API error: ${res.status}`);
    }

    return res.json();
  }

  async getCategories(includePackages = false): Promise<TebexCategory[]> {
    const publicToken = this.getPublicToken();
    if (!publicToken) {
      console.warn("Tebex public token not configured in config.yml");
      return [];
    }

    try {
      const params = includePackages ? "?includePackages=1" : "";
      const response = await this.fetch<{ data: TebexCategory[] }>(
        `/api/accounts/${publicToken}/categories${params}`
      );
      if (includePackages && response.data?.length > 0) {
        // Map prices for packages inside categories
        response.data.forEach(cat => {
          if (cat.packages) {
            cat.packages = cat.packages.map(pkg => ({
              ...pkg,
              price: pkg.total_price || pkg.base_price || 0,
              sale: (pkg.discount && pkg.discount > 0) ? {
                active: true,
                discount: pkg.discount
              } : undefined,
            }));
          }
        });

        console.log("[Debug] First category packages:", JSON.stringify(response.data[0].packages?.[0] || "No packages", null, 2));
      }
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch Tebex categories:", error);
      return [];
    }
  }

  async getCategory(categoryId: number): Promise<TebexCategory | null> {
    const publicToken = this.getPublicToken();
    if (!publicToken) return null;

    try {
      const response = await this.fetch<{ data: TebexCategory }>(
        `/api/accounts/${publicToken}/categories/${categoryId}?includePackages=1`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch Tebex category:", error);
      return null;
    }
  }

  async getPackages(): Promise<TebexPackage[]> {
    const categories = await this.getCategories(true);
    const packages: TebexPackage[] = [];

    for (const category of categories) {
      if (category.packages) {
        packages.push(...category.packages.map(pkg => ({
          ...pkg,
          price: pkg.total_price || pkg.base_price || 0,
          sale: (pkg.discount && pkg.discount > 0) ? {
            active: true,
            discount: pkg.discount
          } : undefined,
          category: { id: category.id, name: category.name },
        })));
      }
    }

    return packages;
  }

  async getPackage(packageId: number): Promise<TebexPackage | null> {
    const packages = await this.getPackages();
    return packages.find(p => p.id === packageId) || null;
  }

  async getFeaturedPackages(featuredIds: string[]): Promise<TebexPackage[]> {
    if (featuredIds.length === 0) {
      const packages = await this.getPackages();
      return packages.slice(0, 4);
    }

    const allPackages = await this.getPackages();
    const idSet = new Set(featuredIds.map(id => parseInt(id)));
    return allPackages.filter(pkg => idSet.has(pkg.id));
  }

  async createBasket(username: string, completeUrl: string, cancelUrl: string): Promise<TebexBasket | null> {
    const publicToken = this.getPublicToken();
    if (!publicToken) {
      console.error("Tebex public token not configured - cannot create basket");
      return null;
    }

    console.log(`[Tebex Debug] Public Token: ${publicToken ? publicToken.substring(0, 8) + '...' : 'MISSING'}`);
    const endpoint = `/api/accounts/${publicToken}/baskets`;
    console.log(`[Tebex] Creating basket for user: ${username} at ${endpoint}`);

    try {
      const response = await this.fetch<{ data: TebexBasket }>(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify({
            username,
            complete_url: completeUrl,
            cancel_url: cancelUrl,
            complete_auto_redirect: true,
          }),
        }
      );
      console.log(`[Tebex] Basket created successfully: ${response.data?.ident}`);
      return response.data;
    } catch (error) {
      console.error("Failed to create Tebex basket:", error);
      console.error("[Tebex] This 404 error usually means:");
      console.error("  1. The Tebex public token is invalid or expired");
      console.error("  2. The Headless API is not enabled for your Tebex store");
      console.error("  3. The token format is incorrect (should be a webstore identifier)");
      console.error("[Tebex] Please verify your token at: https://creator.tebex.io/");
      return null;
    }
  }

  async getBasket(basketIdent: string): Promise<TebexBasket | null> {
    const publicToken = this.getPublicToken();
    if (!publicToken) return null;

    try {
      const response = await this.fetch<{ data: TebexBasket }>(
        `/api/accounts/${publicToken}/baskets/${basketIdent}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get Tebex basket:", error);
      return null;
    }
  }

  async addPackageToBasket(basketIdent: string, packageId: number, quantity = 1): Promise<TebexBasket | null> {
    try {
      const response = await this.fetch<{ data: TebexBasket }>(
        `/api/baskets/${basketIdent}/packages`,
        {
          method: "POST",
          body: JSON.stringify({
            package_id: packageId,
            quantity,
          }),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to add package to basket:", error);
      if (error instanceof Response) {
        try {
          const errText = await error.text();
          console.error("API Error Body:", errText);
        } catch (e) { }
      }
      return null;
    }
  }

  async removePackageFromBasket(basketIdent: string, packageId: number): Promise<TebexBasket | null> {
    try {
      const response = await this.fetch<{ data: TebexBasket }>(
        `/api/baskets/${basketIdent}/packages/remove`,
        {
          method: "POST",
          body: JSON.stringify({
            package_id: packageId,
          }),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to remove package from basket:", error);
      return null;
    }
  }

  async getCoupons(): Promise<any[]> {
    const privateKey = this.getPrivateKey();
    if (!privateKey) {
      console.warn("Tebex private key not configured for coupons");
      return [];
    }

    try {
      const response = await fetch("https://plugin.tebex.io/coupons", {
        headers: {
          "X-Tebex-Secret": privateKey,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch coupons:", response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch Tebex coupons:", error);
      return [];
    }
  }

  async getSales(): Promise<any[]> {
    const privateKey = this.getPrivateKey();
    if (!privateKey) {
      console.warn("Tebex private key not configured for sales");
      return [];
    }

    try {
      const response = await fetch("https://plugin.tebex.io/sales", {
        headers: {
          "X-Tebex-Secret": privateKey,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch sales:", response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch Tebex sales:", error);
      return [];
    }
  }

  async getGiftCards(): Promise<any[]> {
    const privateKey = this.getPrivateKey();
    if (!privateKey) {
      console.warn("Tebex private key not configured for gift cards");
      return [];
    }

    try {
      const response = await fetch("https://plugin.tebex.io/gift-cards", {
        headers: {
          "X-Tebex-Secret": privateKey,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch gift cards:", response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch Tebex gift cards:", error);
      return [];
    }
  }

  async getCommunityGoals(): Promise<TebexCommunityGoal[]> {
    const pluginKey = this.getPluginApiKey();
    if (!pluginKey) {
      console.warn("Tebex plugin API key not configured for community goals");
      return [];
    }

    try {
      const response = await fetch("https://plugin.tebex.io/community_goals", {
        headers: {
          "X-Tebex-Secret": pluginKey,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch community goals:", response.status);
        return [];
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data as TebexCommunityGoal[];
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data as TebexCommunityGoal[];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch Tebex community goals:", error);
      return [];
    }
  }

  async getRecentPayments(limit = 10): Promise<any[]> {
    const privateKey = this.getPrivateKey();
    if (!privateKey) {
      console.warn("Tebex private key not configured for payments");
      return [];
    }

    try {
      const response = await fetch(`https://plugin.tebex.io/payments?limit=${limit}`, {
        headers: {
          "X-Tebex-Secret": privateKey,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch payments:", response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch Tebex payments:", error);
      return [];
    }
  }
}


export const tebexClient = new TebexClient();
