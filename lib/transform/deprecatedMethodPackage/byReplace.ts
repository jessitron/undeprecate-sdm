import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { CodeTransform } from "@atomist/sdm";

export function replaceGuavaMethodWithStandard(): CodeTransform {

    const oldMethodCall = "Iterators.emptyIterator()";
    const newMethodCall = "Collections.emptyIterator()";

    return async project => {
        await doWithFiles(project, "**/*.java", async f => {
            const content = await f.getContent();
            if (content.includes(oldMethodCall)) {
                await f.replaceAll(oldMethodCall, newMethodCall);
            }
        });
    };
}
