import { Project, ProjectReview } from "@atomist/automation-client";
import { CodeInspection } from "@atomist/sdm";

export function lookAtAnnotationParameters(params:
    {
        annotationName: string,
    }): CodeInspection<ProjectReview> {
    return async (p: Project) => {
        return { repoId: p.id, comments: [] };
    };
}
