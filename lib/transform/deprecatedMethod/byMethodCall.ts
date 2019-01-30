import { Java9FileParser } from "@atomist/antlr";
import { astUtils } from "@atomist/automation-client";
import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { CodeTransform } from "@atomist/sdm";

export function changeDeprecatedMethodWithAST(params: {
    deprecatedMethodName: string,
    replacementMethodName: string,
}): CodeTransform {
    // TODO this won't match chm.createEntrySet() on its own line
    // and it won't match methodInvocation_lf_primary whatever that is.
    return project => astUtils.doWithAllMatches(project, Java9FileParser, "**/*.java",
        `/compilationUnit//methodInvocation_lfno_primary/identifier/Identifier[@value='${
        params.deprecatedMethodName
        }']`,
        matchResult => {
            console.log("The value was: " + matchResult.$value);
            matchResult.$value = params.replacementMethodName;
        });
}
