import { Java9FileParser } from "@atomist/antlr";
import { Project } from "@atomist/automation-client";
import { matchIterator } from "@atomist/automation-client/lib/tree/ast/astUtils";

export async function hasImport(importName: string, p: Project, path: string): Promise<boolean> {
    // we could also check for a static, but I think that'd be separate
    const specificPackageImport =
        `/compilationUnit//importDeclaration//typeName[@value='${importName}']`;

    const it = await matchIterator(p, {
        globPatterns: path,
        pathExpression: specificPackageImport,
        parseWith: Java9FileParser,
    });
    for await (const m of it) {
        console.log("use m1 " + !!m);
        return true;
    }

    const oneHigherPackage = dropClassName(importName);
    const dotStarImport = `/compilationUnit//importDeclaration[//MUL]//packageOrTypeName[@value='${oneHigherPackage}']`;
    const it2 = await matchIterator(p, {
        globPatterns: path,
        pathExpression: dotStarImport,
        parseWith: Java9FileParser,
    });
    for await (const m of it2) {
        console.log("use m2 " + !!m);
        return true;
    }

    return false;
}

export async function addImport(p: Project, importName: string, path: string): Promise<void> {
    if (hasImport(importName, p, path)) {
        return;
    }
    const allImportsPxe = `//importDeclaration`;

    const it = await matchIterator(p, {
        globPatterns: path,
        pathExpression: allImportsPxe,
        parseWith: Java9FileParser,
    });
    for await (const m of it) {
        // console.log(JSON.stringify(m));
        m.$value = `import ${importName};\n${m.$value}`;
        console.log("Doing magic: value=" + m.$value);

        //  break;
    }
    (p as any).flush(); // still doesn't help
}

function dropClassName(qualifiedClass: string): string {
    const segments = qualifiedClass.split(".");
    segments.pop();
    return segments.join(".");
}
