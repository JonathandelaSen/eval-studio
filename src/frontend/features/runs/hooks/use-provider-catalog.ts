import * as React from "react";
import type { ProvidersResponse } from "@/app/api/providers/responses";
import { listProviders } from "../api/runs-api";

export function useProviderCatalog() {
  const [providers, setProviders] = React.useState<ProvidersResponse["providers"]>([]);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    let active = true;
    listProviders()
      .then((response) => { if (active) setProviders(response.providers); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Provider discovery failed."); });
    return () => { active = false; };
  }, []);
  return { providers, error };
}
