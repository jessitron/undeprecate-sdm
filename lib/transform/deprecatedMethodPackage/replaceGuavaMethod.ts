import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { CodeTransform } from "@atomist/sdm";
import { addImport, removeImport } from "../java";

export function replaceGuavaMethodWithStandard(): CodeTransform {

    const oldMethodCall = "Iterators.emptyIterator()";
    const newMethodCall = "Collections.emptyIterator()";

    const newPackage = "java.util.Collections";
    const oldPackage = "com.google.common.collect.Iterators";

    return async project => {
        await doWithFiles(project, "**/*.java", async f => {
            const content = await f.getContent();
            if (content.includes(oldMethodCall)) {
                await f.replaceAll(oldMethodCall, newMethodCall);
                await addImport(newPackage, project, f.path);
                if (!mightUse(oldPackage, content)) {
                    await removeImport(oldPackage, project, f.path);
                }
            }
        });
    };
}

function mightUse(qualifiedClass: string, javaFileContent: string): boolean {

    const withoutImport = javaFileContent.replace(`import ${qualifiedClass}`, "");

    const justTheClass = qualifiedClass.split(".").pop() || "";

    return new RegExp(`\b${justTheClass}\b`).test(withoutImport);
}
