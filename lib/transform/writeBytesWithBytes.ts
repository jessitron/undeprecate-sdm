import { astUtils, MatchResult, MicrogrammarBasedFileParser } from "@atomist/automation-client";
import {
    Grammar,
    microgrammar,
    parenthesizedExpression,
} from "@atomist/microgrammar";
import { PatternMatch } from "@atomist/microgrammar/lib/PatternMatch";
import { CodeTransform } from "@atomist/sdm";
import { addImport } from "./java";

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

export function writeBytesWithBytes(globPatterns: string = "**/*.java"): CodeTransform {
    // writeBytes("thing") -> write("thing".getBytes(Charsets.UTF_8))
    return async p => {
        const it = astUtils.fileHitIterator(p, {
            globPatterns,
            pathExpression: "//file/call[/methodCall[@value='writeBytes']]",
            parseWith: new MicrogrammarBasedFileParser("file", "call",
                simpleMethodCallGrammar()),
        });
        for await (const fileHit of it) {
            for (const match of fileHit.matches) {
                const typedMatch = match as (MatchResult & Call);
                // console.log(match);
                typedMatch.$value = `write(${typedMatch.singleArg.block}.getBytes(Charsets.UTF_8)`;
            }
            await addImport("com.google.common.base.Charsets", p, fileHit.file.path);
        }
    };
}
