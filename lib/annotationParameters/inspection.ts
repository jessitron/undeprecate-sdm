import { Java9FileParser } from "@atomist/antlr";
import { astUtils, MatchResult, Project, ProjectReview, ReviewComment } from "@atomist/automation-client";
import { CodeInspection, CodeInspectionResult, CommandListenerInvocation } from "@atomist/sdm";
import { TreeNode } from "@atomist/tree-path";

interface AnnotationAstNode {
    normalAnnotation?: {
        elementValuePairList: TreeNode & {
            elementValuePairs: Array<{
                identifier: { Identifier: string },
                elementValue: MatchResult,
            }>,
        },
    };
    singleElementAnnotation?: {
        elementValue: TreeNode,
    };
}

export function lookAtAnnotationParameters(params:
    {
        annotationName: string,
    }): CodeInspection<ProjectReview> {
    return async (p: Project) => {

        const matches = await astUtils.findMatches<AnnotationAstNode>(
            p,
            Java9FileParser,
            "src/main/java/**/*Application.java", `//annotation[//identifier[@value='${params.annotationName}']]`,
        );

        // Create a review comment with the contents of the parameters, or else "no parameters"
        const comments: ReviewComment[] = matches.map(m => {
            let detail;
            if (m.normalAnnotation) {
                // there are multiple parameters; stick the whole list in there
                detail = m.normalAnnotation.elementValuePairList.$value || "";
            } else if (m.singleElementAnnotation) {
                // there is one parameter; it defaults to be called 'value'
                detail = "value = " + m.singleElementAnnotation.elementValue.$value;
            } else {
                detail = "no parameters";
            }
            const c: ReviewComment = {
                detail,
                severity: "info",
                category: params.annotationName,
            };
            return c;
        });

        return { repoId: p.id, comments };
    };
}

export function printInspectionResults(
    results: Array<CodeInspectionResult<ProjectReview>>,
    ci: CommandListenerInvocation): Promise<void> {
    return ci.addressChannels(results.map(r => {
        if (!r.result || r.result.comments.length < 1) {
            return "no SpringBootApplication annotation found in " + r.repoId.repo;
        }
        return r.repoId.repo + " SpringBootApplication(" + r.result.comments.map(c => c.detail).join(" ...and... ") + ")";
    }).join("\n"));
}
