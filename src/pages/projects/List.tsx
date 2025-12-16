import { ask } from "@tauri-apps/plugin-dialog";
import { EditIcon, FolderIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClaudeProjects, useDeleteClaudeProject } from "../../lib/query";

function ProjectsListContent() {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { data: projects, isLoading, error } = useClaudeProjects();
	const deleteProject = useDeleteClaudeProject();

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
					{t("projects.error", { error: error.message })}
				</div>
			</div>
		);
	}

	const handleDeleteProject = async (projectPath: string) => {
		const confirmed = await ask(t("projects.deleteConfirm", { projectPath }), {
			title: t("projects.deleteTitle"),
			kind: "warning",
		});

		if (confirmed) {
			deleteProject.mutate(projectPath);
		}
	};

	const handleEditProject = (projectPath: string) => {
		const encodedPath = encodeURIComponent(projectPath);
		navigate(`/projects/${encodedPath}`);
	};

	return (
		<div className="">
			<div
				className="flex items-center p-3 border-b px-3 justify-between sticky top-0 bg-background z-10"
				data-tauri-drag-region
			>
				<div data-tauri-drag-region>
					<h3 className="font-bold" data-tauri-drag-region>
						{t("projects.title")}
					</h3>
					<p className="text-sm text-muted-foreground" data-tauri-drag-region>
						{t("projects.description")}
					</p>
				</div>
				<Button
					variant="ghost"
					className="text-muted-foreground"
					size="sm"
					onClick={() => navigate('/projects/new')}
				>
					<PlusIcon size={14} />
					{t("projects.addProject")}
				</Button>
			</div>
			<div className="">
				{!projects || projects.length === 0 ? (
					<div className="text-center text-muted-foreground py-8">
						<FolderIcon className="h-12 w-12 mx-auto mb-4" />
						<div>
							<h3 className="text-lg font-medium mb-1">{t("projects.noProjects")}</h3>
							<p className="text-sm">
								{t("projects.noProjectsDescription")}
							</p>
						</div>
					</div>
				) : (
					<ScrollArea className="h-full">
						<div className="">
							<Accordion type="multiple" className="">
								{projects.map((project) => (
									<AccordionItem
										key={project.path}
										value={project.path}
										className="bg-card"
									>
										<AccordionTrigger className="hover:no-underline px-4 py-2 bg-card hover:bg-accent duration-150">
											<div className="flex items-center gap-2">
												<FolderIcon size={12} />
												<span className="font-medium">{project.path}</span>
											</div>
										</AccordionTrigger>
										<AccordionContent className="pb-3">
											<div className="px-3 pt-3 space-y-3">
												<div className="bg-muted/50 p-3 rounded-lg">
													<h4 className="text-sm font-medium mb-2">{t("projects.configOverview")}</h4>
													<div className="text-sm text-muted-foreground">
														{Object.keys(project.config).length > 0 ? (
															<div className="space-y-1">
																{Object.entries(project.config)
																	.slice(0, 5)
																	.map(([key, value]) => (
																		<div key={key} className="font-mono text-xs">
																			<span className="font-medium">{key}:</span>{" "}
																			{typeof value === "object"
																				? JSON.stringify(value, null, 2)
																				: String(value)}
																		</div>
																	))}
																{Object.keys(project.config).length > 5 && (
																	<div className="text-xs text-muted-foreground mt-2">
																		...{t("projects.moreConfigs", { count: Object.keys(project.config).length - 5 })}
																	</div>
																)}
															</div>
														) : (
															<span className="text-muted-foreground">{t("projects.noConfig")}</span>
														)}
													</div>
												</div>
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleEditProject(project.path)}
													>
														<EditIcon className="h-4 w-4 mr-1" />
														{t("projects.edit")}
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDeleteProject(project.path)}
														disabled={deleteProject.isPending}
														className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
													>
														<TrashIcon className="h-4 w-4 mr-1" />
														{deleteProject.isPending ? t("projects.deleting") : t("projects.delete")}
													</Button>
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

export function List() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">Loading projects...</div>
				</div>
			}
		>
			<ProjectsListContent />
		</Suspense>
	);
}