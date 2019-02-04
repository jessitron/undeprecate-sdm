import { astUtils, MicrogrammarBasedFileParser } from "@atomist/automation-client";
import { CodeTransform } from "@atomist/sdm";
import { Grammar, microgrammar, parenthesizedExpression } from "@atomist/microgrammar";

interface Call {
    methodCall: string;
    // Comes from parenthesizedExpression
    singleArg: { block: string };
}

function oldMethodGrammar(oldMethodName: string): Grammar<Call> {
    return microgrammar<Call>({
        methodCall: oldMethodName,
        singleArg: parenthesizedExpression(),
    });
}

export function writeBytesWithBytes(): CodeTransform {
    // writeBytes("thing") -> write("thing".getBytes(Charsets.UTF_8))
    return async p => {
        const it = astUtils.matchIterator<Call>(p, {
            globPatterns: "**/*.java",
            pathExpression: "//file/call",
            parseWith: new MicrogrammarBasedFileParser("file", "call",
                oldMethodGrammar("writeBytes")),
        });
        for await (const match of it) {
            // console.log(match);
            match.$value = `write${match.singleArg.block}.getBytes(Charsets.UTF_8)`;
        }
    };
}
