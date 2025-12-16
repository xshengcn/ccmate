import { BrainIcon, FolderOpenIcon, TrashIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClaudeSkills, useDeleteClaudeSkill, useOpenSkillsDirectory } from "../lib/query";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Suspense } from "react";

function SkillsPageContent() {
	const { t } = useTranslation();
	const { data: skills, isLoading, error } = useClaudeSkills();
	const deleteSkill = useDeleteClaudeSkill();
	const openSkillsDirectory = useOpenSkillsDirectory();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">{t("loading")}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center text-red-500">
					{t("skills.error", { error: error.message })}
				</div>
			</div>
		);
	}

	const handleDeleteSkill = async (skillName: string) => {
		deleteSkill.mutate(skillName);
	};

	const renderSkillContent = (skill: any) => {
		let displayContent = skill.content;
		let hasFrontmatter = false;

		// Check if content has YAML frontmatter
		const contentLines = skill.content.split('\n');
		if (contentLines.length >= 3 && contentLines[0] === '---') {
			const secondDividerIndex = contentLines.slice(1).indexOf('---');
			if (secondDividerIndex !== -1) {
				// Remove YAML frontmatter for display
				displayContent = contentLines.slice(secondDividerIndex + 2).join('\n');
				hasFrontmatter = true;
			}
		}

		return (
			<div className="bg-muted/50 p-3 rounded-lg">
				<div className="text-sm text-muted-foreground whitespace-pre-wrap font-mono text-xs max-h-60 overflow-y-auto">
					{displayContent.trim() || t("skills.noContent")}
				</div>
			</div>
		);
	};

	return (
		<div className="">
			<div
				className="flex items-center p-3 border-b px-3 justify-between sticky top-0 bg-background z-10"
				data-tauri-drag-region
			>
				<div data-tauri-drag-region>
					<h3 className="font-bold" data-tauri-drag-region>
						{t("skills.title")}
					</h3>
					<p className="text-sm text-muted-foreground" data-tauri-drag-region>
						{t("skills.description")}
					</p>
				</div>
				<Button
					variant="ghost"
					className="text-muted-foreground"
					size="sm"
					onClick={() => openSkillsDirectory.mutate()}
					disabled={openSkillsDirectory.isPending}
				>
					<FolderOpenIcon size={14} />
					{t("skills.openFolder")}
				</Button>
			</div>
			<div className="">
				{!skills || skills.length === 0 ? (
					<div className="text-center text-muted-foreground py-8">
						<BrainIcon className="h-12 w-12 mx-auto mb-4" />
						<div>
							<h3 className="text-lg font-medium mb-1">{t("skills.noSkills")}</h3>
							<p className="text-sm">
								{t("skills.noSkillsDescription")}
							</p>
						</div>
					</div>
				) : (
					<ScrollArea className="h-full">
						<div className="">
							<Accordion type="multiple" className="">
								{skills.map((skill) => (
									<AccordionItem
										key={skill.name}
										value={skill.name}
										className="bg-card"
									>
										<AccordionTrigger className="hover:no-underline px-4 py-2 bg-card hover:bg-accent duration-150">
											<div className="flex items-center gap-2">
												<BrainIcon size={12} />
												<span className="font-medium">
													{skill.metadata?.name || skill.name}
												</span>
											</div>
										</AccordionTrigger>
										<AccordionContent className="pb-3">
											<div className="px-3 pt-3 space-y-3">
												{skill.metadata && (
													<div className="bg-muted/30 p-3 rounded-lg">
														<h4 className="text-sm font-medium mb-2">
															{t("skills.metadata")}
														</h4>
														<div className="space-y-2">
															<div>
																<span className="text-sm font-medium">{t("skills.name")}:</span>{" "}
																<span className="text-sm">{skill.metadata.name}</span>
															</div>
															<div>
																<span className="text-sm font-medium">{t("skills.description")}:</span>{" "}
																<span className="text-sm">{skill.metadata.description}</span>
															</div>
															{skill.metadata.allowedTools && skill.metadata.allowedTools.length > 0 && (
																<div>
																	<span className="text-sm font-medium">{t("skills.allowedTools")}:</span>{" "}
																	<div className="flex flex-wrap gap-1 mt-1">
																		{skill.metadata.allowedTools.map((tool: string) => (
																			<span
																				key={tool}
																				className="inline-block px-2 py-1 text-xs bg-muted rounded-md"
																			>
																				{tool}
																			</span>
																		))}
																	</div>
																</div>
															)}
														</div>
													</div>
												)}
												{renderSkillContent(skill)}
												<div className="flex justify-end">
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																variant="outline"
																size="sm"
																disabled={deleteSkill.isPending}
																className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
															>
																<TrashIcon className="h-4 w-4 mr-1" />
																{deleteSkill.isPending ? t("skills.deleting") : t("skills.delete")}
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>{t("skills.deleteTitle")}</AlertDialogTitle>
																<AlertDialogDescription>
																	{t("skills.deleteConfirm", { skillName: skill.name })}
																	<div className="mt-2 p-2 bg-muted rounded text-sm font-mono">
																		{skill.path}
																	</div>
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>{t("skills.cancel")}</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => handleDeleteSkill(skill.name)}
																	className="bg-destructive hover:bg-destructive/90"
																>
																	{t("skills.delete")}
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					</ScrollArea>
				)}
			</div>
		</div>
	);
}

export function SkillsPage() {
	const { t } = useTranslation();

	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">{t("loading")}</div>
				</div>
			}
		>
			<SkillsPageContent />
		</Suspense>
	);
}