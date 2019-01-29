import { CommandListenerInvocation, TransformResult } from "@atomist/sdm";
import { Attachment, SlackMessage } from "@atomist/slack-messages";

export async function actualGoodUsefulReactionToTransformResults(
    trs: TransformResult[],
    cli: CommandListenerInvocation) {

    const attachments: Attachment[] = trs.map(tr => {
        const projectId = tr.target.id;

        const common: Partial<Attachment> = {
            author_name: `${projectId.owner}/${projectId.repo}`,
            author_link: tr.target.id.url,
        };

        if (tr.error) {
            return {
                ...common,
                color: "#f00000",
                fallback: "failed transform result",
                mrkdwn_in: ["text"],
                title: "ERROR",
                text: "```\n" + tr.error.message + "\n```",
            };
        }
        if (tr.edited) {
            return {
                ...common,
                fallback: "successful transform result",
                color: "#00f000",
                // TODO: specify where it put the thing, that is the point
            };
        }
        // it did nothing
        return {
            ...common,
            fallback: "no changes to make",
            text: "No changes made",
        };
    });

    const message: SlackMessage = {
        text: "Results of running " + cli.commandName,
        attachments,
    };

    return cli.addressChannels(message);
}
