import { Java9FileParser } from "@atomist/antlr";
import { astUtils, Project, ProjectFile } from "@atomist/automation-client";
import { evaluateExpression, isSuccessResult, TreeNode } from "@atomist/tree-path";

export async function hasImport(importName: string, file: ProjectFile): Promise<boolean> {
    // we could also check for a static, but I think that'd be separate
    const parsed = await Java9FileParser.toAst(file);

    return astHasImport(importName, parsed);
}

function astHasImport(importName: string, javaAST: TreeNode): boolean {
    const specificPackageImport =
        `/compilationUnit//importDeclaration//typeName[@value='${importName}']`;
    const specificMatch = evaluateExpression(javaAST, specificPackageImport);
    if (isSuccessResult(specificMatch)) {
        return true;
    }

    const dotStarImport = `/compilationUnit//importDeclaration[//MUL]//typeName[@value='${dropClassName(importName)}']`;
    const starMatch = evaluateExpression(javaAST, dotStarImport);
    if (isSuccessResult(starMatch)) {
        return true;
    }

    return false;
}

export async function addImport(importName: string, file: ProjectFile): Promise<void> {
    const parsed = await Java9FileParser.toAst(file);
    if (astHasImport(importName, parsed)) {
        return;
    }
    const allImportsPxe =
        `//importDeclaration`;
    const allImportMatches = evaluateExpression(parsed, allImportsPxe);
    if (!isSuccessResult(allImportMatches)) {
        throw new Error("Error seeking imports: " + allImportMatches);
    }
    if (allImportMatches.length === 0) {
        throw new Error("Unhandled case: Java file with no import statements");
        // get the package declaration (if any) and put it after that
        // if none, put it at the beginning of the file
    }
    const lastImport = allImportMatches[allImportMatches.length - 1];

    // do I have to make this updatable? probably.

    console.log("setting import");
    lastImport.$value = lastImport.$value + `\nimport ${importName};`;

}

function dropClassName(qualifiedClass: string): string {
    const segments = qualifiedClass.split(".");
    segments.pop();
    return segments.join(".");
}
