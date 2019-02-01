import { Java9FileParser } from "@atomist/antlr";
import { astUtils, Project } from "@atomist/automation-client";

export async function hasImport(importName: string, p: Project, path: string): Promise<boolean> {
    // we could also check for a .* import

    // this one could really be a ".includes". But it's such a cute path expression
    const specificPackageImport =
        `/compilationUnit//importDeclaration//typeName[@value='${importName}']`;

    const matches = await astUtils.findMatches(p, Java9FileParser, path, specificPackageImport);

    return matches.length > 0;
}
