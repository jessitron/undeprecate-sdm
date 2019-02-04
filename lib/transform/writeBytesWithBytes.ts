import { astUtils, MicrogrammarBasedFileParser } from "@atomist/automation-client";
import { CodeTransform } from "@atomist/sdm";
import { Grammar, microgrammar, parenthesizedExpression } from "@atomist/microgrammar";

interface Call {
    methodCall: string;
    // Comes from parenthesizedExpression
    singleArg: { block: string };
}

function simpleMethodCallGrammar(): Grammar<Call> {
    return microgrammar<Call>({
        methodCall: /[a-zA-Z_$][a-zA-Z0-9_$]+/,
        singleArg: parenthesizedExpression(),
    });
}

export function writeBytesWithBytes(): CodeTransform {
    // writeBytes("thing") -> write("thing".getBytes(Charsets.UTF_8))
    return async p => {
        const it = astUtils.matchIterator<Call>(p, {
            globPatterns: "**/*.java",
            pathExpression: "//file/call[/methodCall[@value='writeBytes']]",
            parseWith: new MicrogrammarBasedFileParser("file", "call",
                simpleMethodCallGrammar()),
        });
        for await (const match of it) {
            // console.log(match);
            match.$value = `write(${match.singleArg.block}.getBytes(Charsets.UTF_8)`;
        }
    };
}
