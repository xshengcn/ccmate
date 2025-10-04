import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export type ConfigType =
  | "user"
  | "project"
  | "project_local"
  | "enterprise_macos"
  | "enterprise_linux"
  | "enterprise_windows"
  | "mcp_macos"
  | "mcp_linux"
  | "mcp_windows";

export interface ConfigFile {
  path: string;
  content: unknown;
  exists: boolean;
}

export const useConfigFiles = () => {
  return useQuery({
    queryKey: ["config-files"],
    queryFn: () => invoke<ConfigType[]>("list_config_files"),
  });
};

export const useConfigFile = (configType: ConfigType) => {
  return useQuery({
    queryKey: ["config-file", configType],
    queryFn: () => invoke<ConfigFile>("read_config_file", { configType }),
    enabled: !!configType,
  });
};

export const useWriteConfigFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ configType, content }: { configType: ConfigType; content: unknown }) =>
      invoke<void>("write_config_file", { configType, content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["config-file", variables.configType] });
      queryClient.invalidateQueries({ queryKey: ["config-files"] });
    },
  });
};


export const useBackupClaudeConfigs = () => {
  return useMutation({
    mutationFn: () => invoke<void>("backup_claude_configs"),
  });
};