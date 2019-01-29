import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { CodeTransform } from "@atomist/sdm";

export function changeDeprecatedMethodWithRegex(params: {
    deprecatedMethodName: string,
    replacementMethodName: string,
}): CodeTransform {
    return async project => {
        await doWithFiles(project, "**/*.java", async f => {
            await f.replaceAll(params.deprecatedMethodName, params.replacementMethodName);
        });
    };
}
