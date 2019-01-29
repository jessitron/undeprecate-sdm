import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { CodeTransform } from "@atomist/sdm";

export function changeDeprecatedMethodWithReplace(params: {
    deprecatedMethodName: string,
    replacementMethodName: string,
}): CodeTransform {
    return project => doWithFiles(project, "**/*.java",
        f => f.replaceAll(params.deprecatedMethodName, params.replacementMethodName));
}
