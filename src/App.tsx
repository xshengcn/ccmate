import { useState } from "react";
import { useConfigFiles, useConfigFile, useWriteConfigFile, type ConfigType, type ConfigFile } from "./lib/query";
import "./App.css";

function App() {
  const [selectedConfig, setSelectedConfig] = useState<ConfigType | "">("");
  const [jsonContent, setJsonContent] = useState<string>("");

  const { data: configFiles, isLoading: configsLoading } = useConfigFiles();
  const { data: configFile, isLoading: configLoading } = useConfigFile(selectedConfig as ConfigType);
  const writeConfigMutation = useWriteConfigFile();

  const handleLoadConfig = () => {
    if (configFile && configFile.content) {
      setJsonContent(JSON.stringify(configFile.content, null, 2));
    }
  };

  const handleSaveConfig = () => {
    if (!selectedConfig) return;

    try {
      const parsedContent = JSON.parse(jsonContent);
      writeConfigMutation.mutate({
        configType: selectedConfig,
        content: parsedContent,
      });
    } catch (error) {
      alert("Invalid JSON format. Please fix the errors and try again.");
    }
  };

  const getConfigDisplayName = (configType: ConfigType) => {
    const displayNames: Record<ConfigType, string> = {
      user: "User Settings (~/.claude/settings.json)",
      project: "Project Settings (.claude/settings.json)",
      project_local: "Project Local Settings (.claude/settings.local.json)",
      enterprise_macos: "Enterprise Settings (macOS)",
      enterprise_linux: "Enterprise Settings (Linux)",
      enterprise_windows: "Enterprise Settings (Windows)",
      mcp_macos: "Managed MCP Servers (macOS)",
      mcp_linux: "Managed MCP Servers (Linux)",
      mcp_windows: "Managed MCP Servers (Windows)",
    };
    return displayNames[configType];
  };

  
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Claude Code Configuration Manager
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Files List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Configuration Files
            </h2>

            {configsLoading ? (
              <p className="text-gray-600">Loading configuration files...</p>
            ) : configFiles && configFiles.length > 0 ? (
              <div className="space-y-2">
                {configFiles.map((configType) => (
                  <div
                    key={configType}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedConfig === configType
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedConfig(configType)}
                  >
                    <div className="font-medium text-gray-900">
                      {getConfigDisplayName(configType)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                No configuration files found. Create one by selecting a type below.
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Create New Configuration
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedConfig("user")}
                  className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div className="font-medium">User Settings</div>
                  <div className="text-sm text-gray-600">
                    Applies to all projects
                  </div>
                </button>
                <button
                  onClick={() => setSelectedConfig("project")}
                  className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div className="font-medium">Project Settings</div>
                  <div className="text-sm text-gray-600">
                    Shared with your team
                  </div>
                </button>
                <button
                  onClick={() => setSelectedConfig("project_local")}
                  className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div className="font-medium">Project Local Settings</div>
                  <div className="text-sm text-gray-600">
                    Personal preferences
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Editor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Configuration Editor
            </h2>

            {selectedConfig ? (
              <div>
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  <div className="font-medium text-gray-900">
                    {getConfigDisplayName(selectedConfig)}
                  </div>
                  {configFile && (
                    <div className="text-sm text-gray-600 mt-1">
                      Path: {configFile.path}
                    </div>
                  )}
                </div>

                {configLoading ? (
                  <p className="text-gray-600">Loading configuration...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button
                        onClick={handleLoadConfig}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Load Content
                      </button>
                      <button
                        onClick={handleSaveConfig}
                        disabled={writeConfigMutation.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {writeConfigMutation.isPending ? "Saving..." : "Save"}
                      </button>
                    </div>

                    <textarea
                      value={jsonContent}
                      onChange={(e) => setJsonContent(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Configuration content in JSON format..."
                      spellCheck={false}
                    />

                    {writeConfigMutation.error && (
                      <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        Error: {writeConfigMutation.error.message}
                      </div>
                    )}

                    {writeConfigMutation.isSuccess && (
                      <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        Configuration saved successfully!
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                Select a configuration file to edit
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
