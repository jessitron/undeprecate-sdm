import { doWithFiles } from "@atomist/automation-client/lib/project/util/projectUtils";
import { CodeTransform, TransformResult } from "@atomist/sdm";
import {
    addImport, addStaticImport,
    hasStaticImport, removeImport, removeStaticImport,
} from "../java";

export function replaceGuavaMethodWithStandard(): CodeTransform {

    const methodName = "emptyIterator";
    const methodCall = methodName + "()";
    const oldClassName = "Iterators";

    const oldMethodCall = oldClassName + "." + methodCall;
    const newMethodCall = "Collections.emptyIterator()";

    const newPackage = "java.util.Collections";
    const oldPackage = "com.google.common.collect.Iterators";

    const todo = `/* TODO: use ${newPackage}.${methodName} */`;

    return async (project): Promise<TransformResult> => {
        let edited = false;
        await doWithFiles(project, "**/*.java", async f => {
            const content = await f.getContent();
            if (content.includes(oldMethodCall)) {
                edited = true;
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
                    edited = true;
                    await addStaticImport(newPackage + "." + methodName, project, f.path);
                    await removeStaticImport(oldStaticImport, project, f.path);
                } else if (hasStaticImport(oldPackage + ".*", project, f.path)) {
                    // if it is statically imported with .*
                    edited = true;
                    await f.replaceAll(methodCall, methodCall + " " + todo);
                }
            }
        });
        return {
            success: true,
            edited,
            target: project,
        };
    };
}

export function mightUse(qualifiedClass: string, javaFileContent: string): boolean {

    const withoutImport = javaFileContent.replace(`import ${qualifiedClass}`, "");

    const justTheClass = qualifiedClass.split(".").pop() || "";

    const r = new RegExp(`\\b${justTheClass}\\b`).test(withoutImport);
    return r;
}
