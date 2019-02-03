import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { CodeTransform } from "@atomist/sdm";
import { addImport, hasStaticImport, removeImport, addStaticImport, removeStaticImport } from "../java";

export function replaceGuavaMethodWithStandard(): CodeTransform {

    const methodName = "emptyIterator";
    const methodCall = methodName + "()";
    const oldClassName = "Iterators";

    const oldMethodCall = oldClassName + "." + methodCall;
    const newMethodCall = "Collections.emptyIterator()";

    const newPackage = "java.util.Collections";
    const oldPackage = "com.google.common.collect.Iterators";

    return async project => {
        await doWithFiles(project, "**/*.java", async f => {
            const content = await f.getContent();
            if (content.includes(oldMethodCall)) {
                await f.replaceAll(oldMethodCall, newMethodCall);
                await addImport(newPackage, project, f.path);
                const newContent = await f.getContent();
                if (!mightUse(oldPackage, newContent)) {
                    await removeImport(oldPackage, project, f.path);
                }
            } else if (content.includes(methodCall)) {
                const oldStaticImport = oldPackage + "." + methodName;
                // maybe it is statically imported
                if (await hasStaticImport(oldStaticImport, project, f.path)) {
                    await addStaticImport(newPackage + "." + methodName, project, f.path);
                    await removeStaticImport(oldStaticImport, project, f.path);
                }
            }

        });
    };
}

export function mightUse(qualifiedClass: string, javaFileContent: string): boolean {

    const withoutImport = javaFileContent.replace(`import ${qualifiedClass}`, "");

    const justTheClass = qualifiedClass.split(".").pop() || "";

    const r = new RegExp(`\\b${justTheClass}\\b`).test(withoutImport);
    return r;
}
