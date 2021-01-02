import { CustomLogger, LogLevel } from "../CustomLogger/CustomLogger";
import { SlackChatPostMessageStream } from "../UrlFetch.Slack/API/Chat/PostMessage/Stream";
import { UrlFetchStream } from "../UrlFetch/UrlFetch";
import { UrlFetchManager } from "../UrlFetch/UrlFetchManager";

type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]: U;
};

export class SlackLogger implements CustomLogger {
    public slackApiToken: string;
    public channelIdTable: EnumDictionary<LogLevel, string[]> = {
        [LogLevel.Debug]: [],
        [LogLevel.Info]: [],
        [LogLevel.Warning]: [],
        [LogLevel.Error]: [],
    };

    log(level: LogLevel, message): void {
        const channelIds = this.channelIdTable[level];
        if (!channelIds || channelIds.length === 0) {
            return;
        }
        const streams: UrlFetchStream[] = [];
        let messageText = message.toString();
        switch (level) {
            case LogLevel.Warning:
                messageText = ":warning: Warning!\n" + messageText;
                break;
            case LogLevel.Error:
                messageText = ":error: Error!!\n" + messageText;
                break;
        }
        for (const channelId of channelIds) {
            const stream = new SlackChatPostMessageStream({
                token: this.slackApiToken,
                channel: channelId,
                text: messageText,
            });
            streams.push(stream);
        }
        UrlFetchManager.execute(streams);
    }

    exception(error: Error): void {
        const channelIds = this.channelIdTable[LogLevel.Error];
        if (!channelIds || channelIds.length === 0) {
            return;
        }
        const streams: UrlFetchStream[] = [];
        const message = `:error: Exception!!!
[Message]
${error.toString()}

[StackTrace]
\`\`\`
${error.stack}
\`\`\``;
        for (const channelId of channelIds) {
            const stream = new SlackChatPostMessageStream({
                token: this.slackApiToken,
                channel: channelId,
                text: message,
            });
            streams.push(stream);
        }
        UrlFetchManager.execute(streams);
    }
}