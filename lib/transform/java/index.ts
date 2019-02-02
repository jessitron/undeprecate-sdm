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
    for await (const { } of it) {
        return true;
    }

    const oneHigherPackage = dropClassName(importName);
    const dotStarImport = `/compilationUnit//importDeclaration[//MUL]//packageOrTypeName[@value='${oneHigherPackage}']`;
    const it2 = await matchIterator(p, {
        globPatterns: path,
        pathExpression: dotStarImport,
        parseWith: Java9FileParser,
    });
    for await (const { } of it2) {
        return true;
    }

    return false;
}

export async function addImport(importName: string, p: Project, path: string): Promise<void> {
    if (await hasImport(importName, p, path)) {
        return;
    }
    const allImportsPxe = `//importDeclaration`;

    const it = await matchIterator(p, {
        globPatterns: path,
        pathExpression: allImportsPxe,
        parseWith: Java9FileParser,
    });
    for await (const m of it) {
        m.$value = `import ${importName};\n${m.$value}`;
        console.log("Doing magic: value=" + m.$value);
        break;
    }
}

export async function removeImport(imported: string, p: Project, path: string): Promise<void> {
    // this should be simple.
    const f = await p.findFile(path);
    await f.replaceAll(`import ${imported};\n`, "");
}

function dropClassName(qualifiedClass: string): string {
    const segments = qualifiedClass.split(".");
    segments.pop();
    return segments.join(".");
}
