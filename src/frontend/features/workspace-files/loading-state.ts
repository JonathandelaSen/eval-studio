export function shouldLoadWorkspaceFiles({
  active,
  loaded,
  loading,
}: {
  active: boolean;
  loaded: boolean;
  loading: boolean;
}) {
  return active && !loaded && !loading;
}
