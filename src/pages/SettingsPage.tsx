import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsPage() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="">
      <div className="flex items-center p-3 border-b px-3 justify-between sticky top-0 bg-background z-10 mb-4" data-tauri-drag-region>
        <div data-tauri-drag-region>
          <h3 className="font-bold" data-tauri-drag-region>{t("settings.title")}</h3>
        </div>
      </div>
      <div className="space-y-6 px-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t("settings.language")}</label>
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("settings.language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}