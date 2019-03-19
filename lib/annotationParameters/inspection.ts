import { Java9FileParser } from "@atomist/antlr";
import { astUtils, Project, ProjectReview, ReviewComment } from "@atomist/automation-client";
import { PatternMatch } from "@atomist/microgrammar/lib/PatternMatch";
import { CodeInspection } from "@atomist/sdm";

interface AnnotationAstNode {
    normalAnnotation?: {
        elementValuePairList: PatternMatch & {
            elementValuePairs: Array<{
                identifier: { Identifier: string },
                elementValue: PatternMatch,
            }>,
        },
    };
    singleElementAnnotation?: {
        elementValue: PatternMatch,
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

        const comments: ReviewComment[] = matches.map(m => {
            let detail;
            if (m.normalAnnotation) {
                detail = m.normalAnnotation.elementValuePairList.$value;
            } else if (m.singleElementAnnotation) {
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
