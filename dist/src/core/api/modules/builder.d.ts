import { ODId, ODValidButtonColor, ODValidId, ODInterfaceWithPartialProperty, ODManagerWithSafety, ODManagerData } from "./base";
import * as discord from "discord.js";
import { ODWorkerManager, ODWorkerCallback } from "./worker";
import { ODDebugger } from "./console";
/**## ODBuilderImplementation `class`
 * This is an Open Ticket builder implementation.
 *
 * It is a basic implementation of the `ODWorkerManager` used by all `ODBuilder` classes.
 *
 * This class can't be used stand-alone & needs to be extended from!
 */
export declare class ODBuilderImplementation<Instance, Source extends string, Params, BuildType extends {
    id: ODId;
}> extends ODManagerData {
    /**The manager that has all workers of this implementation */
    workers: ODWorkerManager<Instance, Source, Params>;
    /**Cache a build or create it every time from scratch when this.build() gets executed. */
    allowCache: boolean;
    /**Did the build already got created/cached? */
    didCache: boolean;
    /**The cache of this build. */
    cache: BuildType | null;
    constructor(id: ODValidId, callback?: ODWorkerCallback<Instance, Source, Params>, priority?: number, callbackId?: ODValidId);
    /**Set if caching is allowed */
    setCacheMode(allowed: boolean): this;
    /**Reset the current cache */
    resetCache(): this;
    /**Execute all workers & return the result. */
    build(source: Source, params: Params): Promise<BuildType>;
}
/**## ODBuilderManager `class`
 * This is an Open Ticket builder manager.
 *
 * It contains all Open Ticket builders. You can find messages, embeds, files & dropdowns, buttons & modals all here!
 *
 * Using the Open Ticket builder system has a few advantages compared to vanilla discord.js:
 * - plugins can extend/edit messages
 * - automatically reply on error
 * - independent workers (with priority)
 * - fail-safe design using try-catch
 * - cache frequently used objects
 * - get to know the source of the build request for a specific message, button, etc
 * - And so much more!
 */
export declare class ODBuilderManager {
    /**The manager for all button builders */
    buttons: ODButtonManager;
    /**The manager for all dropdown builders */
    dropdowns: ODDropdownManager;
    /**The manager for all file/attachment builders */
    files: ODFileManager;
    /**The manager for all embed builders */
    embeds: ODEmbedManager;
    /**The manager for all message builders */
    messages: ODMessageManager;
    /**The manager for all modal builders */
    modals: ODModalManager;
    constructor(debug: ODDebugger);
}
/**## ODComponentBuildResult `interface`
 * This interface contains the result from a built component (button/dropdown). This can be used in the `ODMessage` builder!
 */
export interface ODComponentBuildResult {
    /**The id of this component (button or dropdown) */
    id: ODId;
    /**The discord component or `\n` when it is a spacer between action rows */
    component: discord.MessageActionRowComponentBuilder | "\n" | null;
}
/**## ODButtonManager `class`
 * This is an Open Ticket button manager.
 *
 * It contains all Open Ticket button builders. Here, you can add your own buttons or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
export declare class ODButtonManager extends ODManagerWithSafety<ODButton<string, any>> {
    constructor(debug: ODDebugger);
    /**Get a newline component for buttons & dropdowns! */
    getNewLine(id: ODValidId): ODComponentBuildResult;
}
/**## ODButtonData `interface`
 * This interface contains the data to build a button.
 */
export interface ODButtonData {
    /**The custom id of this button */
    customId: string;
    /**The mode of this button */
    mode: "button" | "url";
    /**The url for when the mode is set to "url" */
    url: string | null;
    /**The button color */
    color: ODValidButtonColor | null;
    /**The button label */
    label: string | null;
    /**The button emoji */
    emoji: string | null;
    /**Is the button disabled? */
    disabled: boolean;
}
/**## ODButtonInstance `class`
 * This is an Open Ticket button instance.
 *
 * It contains all properties & functions to build a button!
 */
export declare class ODButtonInstance {
    /**The current data of this button */
    data: ODButtonData;
    /**Set the custom id of this button */
    setCustomId(id: ODButtonData["customId"]): this;
    /**Set the mode of this button */
    setMode(mode: ODButtonData["mode"]): this;
    /**Set the url of this button */
    setUrl(url: ODButtonData["url"]): this;
    /**Set the color of this button */
    setColor(color: ODButtonData["color"]): this;
    /**Set the label of this button */
    setLabel(label: ODButtonData["label"]): this;
    /**Set the emoji of this button */
    setEmoji(emoji: ODButtonData["emoji"]): this;
    /**Disable this button */
    setDisabled(disabled: ODButtonData["disabled"]): this;
}
/**## ODButton `class`
 * This is an Open Ticket button builder.
 *
 * With this class, you can create a button to use in a message.
 * The only difference with normal buttons is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
export declare class ODButton<Source extends string, Params> extends ODBuilderImplementation<ODButtonInstance, Source, Params, ODComponentBuildResult> {
    /**Build this button & compile it for discord.js */
    build(source: Source, params: Params): Promise<ODComponentBuildResult>;
}
/**## ODQuickButton `class`
 * This is an Open Ticket quick button builder.
 *
 * With this class, you can quickly create a button to use in a message.
 * This quick button can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these buttons are less customisable by other plugins.
 */
export declare class ODQuickButton {
    /**The id of this button. */
    id: ODId;
    /**The current data of this button */
    data: Partial<ODButtonData>;
    constructor(id: ODValidId, data: Partial<ODButtonData>);
    /**Build this button & compile it for discord.js */
    build(): Promise<ODComponentBuildResult>;
}
/**## ODDropdownManager `class`
 * This is an Open Ticket dropdown manager.
 *
 * It contains all Open Ticket dropdown builders. Here, you can add your own dropdowns or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
export declare class ODDropdownManager extends ODManagerWithSafety<ODDropdown<string, any>> {
    constructor(debug: ODDebugger);
    /**Get a newline component for buttons & dropdowns! */
    getNewLine(id: ODValidId): ODComponentBuildResult;
}
/**## ODDropdownData `interface`
 * This interface contains the data to build a dropdown.
 */
export interface ODDropdownData {
    /**The custom id of this dropdown */
    customId: string;
    /**The type of this dropdown */
    type: "string" | "role" | "channel" | "user" | "mentionable";
    /**The placeholder of this dropdown */
    placeholder: string | null;
    /**The minimum amount of items to be selected in this dropdown */
    minValues: number | null;
    /**The maximum amount of items to be selected in this dropdown */
    maxValues: number | null;
    /**Is this dropdown disabled? */
    disabled: boolean;
    /**Allowed channel types when the type is "channel" */
    channelTypes: discord.ChannelType[];
    /**The options when the type is "string" */
    options: discord.SelectMenuComponentOptionData[];
    /**The options when the type is "user" */
    users: discord.User[];
    /**The options when the type is "role" */
    roles: discord.Role[];
    /**The options when the type is "channel" */
    channels: discord.Channel[];
    /**The options when the type is "mentionable" */
    mentionables: (discord.User | discord.Role)[];
}
/**## ODDropdownInstance `class`
 * This is an Open Ticket dropdown instance.
 *
 * It contains all properties & functions to build a dropdown!
 */
export declare class ODDropdownInstance {
    /**The current data of this dropdown */
    data: ODDropdownData;
    /**Set the custom id of this dropdown */
    setCustomId(id: ODDropdownData["customId"]): this;
    /**Set the type of this dropdown */
    setType(type: ODDropdownData["type"]): this;
    /**Set the placeholder of this dropdown */
    setPlaceholder(placeholder: ODDropdownData["placeholder"]): this;
    /**Set the minimum amount of values in this dropdown */
    setMinValues(minValues: ODDropdownData["minValues"]): this;
    /**Set the maximum amount of values ax this dropdown */
    setMaxValues(maxValues: ODDropdownData["maxValues"]): this;
    /**Set the disabled of this dropdown */
    setDisabled(disabled: ODDropdownData["disabled"]): this;
    /**Set the channel types of this dropdown */
    setChannelTypes(channelTypes: ODDropdownData["channelTypes"]): this;
    /**Set the options of this dropdown (when `type == "string"`) */
    setOptions(options: ODDropdownData["options"]): this;
    /**Set the users of this dropdown (when `type == "user"`) */
    setUsers(users: ODDropdownData["users"]): this;
    /**Set the roles of this dropdown (when `type == "role"`) */
    setRoles(roles: ODDropdownData["roles"]): this;
    /**Set the channels of this dropdown (when `type == "channel"`) */
    setChannels(channels: ODDropdownData["channels"]): this;
    /**Set the mentionables of this dropdown (when `type == "mentionable"`) */
    setMentionables(mentionables: ODDropdownData["mentionables"]): this;
}
/**## ODDropdown `class`
 * This is an Open Ticket dropdown builder.
 *
 * With this class, you can create a dropdown to use in a message.
 * The only difference with normal dropdowns is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
export declare class ODDropdown<Source extends string, Params> extends ODBuilderImplementation<ODDropdownInstance, Source, Params, ODComponentBuildResult> {
    /**Build this dropdown & compile it for discord.js */
    build(source: Source, params: Params): Promise<ODComponentBuildResult>;
}
/**## ODQuickDropdown `class`
 * This is an Open Ticket quick dropdown builder.
 *
 * With this class, you can quickly create a dropdown to use in a message.
 * This quick dropdown can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these dropdowns are less customisable by other plugins.
 */
export declare class ODQuickDropdown {
    /**The id of this dropdown. */
    id: ODId;
    /**The current data of this dropdown */
    data: Partial<ODDropdownData>;
    constructor(id: ODValidId, data: Partial<ODDropdownData>);
    /**Build this dropdown & compile it for discord.js */
    build(): Promise<ODComponentBuildResult>;
}
/**## ODFileManager `class`
 * This is an Open Ticket file manager.
 *
 * It contains all Open Ticket file builders. Here, you can add your own files or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
export declare class ODFileManager extends ODManagerWithSafety<ODFile<string, any>> {
    constructor(debug: ODDebugger);
}
/**## ODFileData `interface`
 * This interface contains the data to build a file.
 */
export interface ODFileData {
    /**The file buffer, string or raw data */
    file: discord.BufferResolvable;
    /**The name of the file */
    name: string;
    /**The description of the file */
    description: string | null;
    /**Set the file to be a spoiler */
    spoiler: boolean;
}
/**## ODFileBuildResult `interface`
 * This interface contains the result from a built file (attachment). This can be used in the `ODMessage` builder!
 */
export interface ODFileBuildResult {
    /**The id of this file */
    id: ODId;
    /**The discord file */
    file: discord.AttachmentBuilder | null;
}
/**## ODFileInstance `class`
 * This is an Open Ticket file instance.
 *
 * It contains all properties & functions to build a file!
 */
export declare class ODFileInstance {
    /**The current data of this file */
    data: ODFileData;
    /**Set the file path of this attachment */
    setFile(file: string): this;
    /**Set the file contents of this attachment */
    setContents(contents: string | Buffer): this;
    /**Set the name of this attachment */
    setName(name: ODFileData["name"]): this;
    /**Set the description of this attachment */
    setDescription(description: ODFileData["description"]): this;
    /**Set this attachment to show as a spoiler */
    setSpoiler(spoiler: ODFileData["spoiler"]): this;
}
/**## ODFile `class`
 * This is an Open Ticket file builder.
 *
 * With this class, you can create a file to use in a message.
 * The only difference with normal files is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
export declare class ODFile<Source extends string, Params> extends ODBuilderImplementation<ODFileInstance, Source, Params, ODFileBuildResult> {
    /**Build this attachment & compile it for discord.js */
    build(source: Source, params: Params): Promise<ODFileBuildResult>;
}
/**## ODQuickFile `class`
 * This is an Open Ticket quick file builder.
 *
 * With this class, you can quickly create a file to use in a message.
 * This quick file can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these files are less customisable by other plugins.
 */
export declare class ODQuickFile {
    /**The id of this file. */
    id: ODId;
    /**The current data of this file */
    data: Partial<ODFileData>;
    constructor(id: ODValidId, data: Partial<ODFileData>);
    /**Build this attachment & compile it for discord.js */
    build(): Promise<ODFileBuildResult>;
}
/**## ODEmbedManager `class`
 * This is an Open Ticket embed manager.
 *
 * It contains all Open Ticket embed builders. Here, you can add your own embeds or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
export declare class ODEmbedManager extends ODManagerWithSafety<ODEmbed<string, any>> {
    constructor(debug: ODDebugger);
}
/**## ODEmbedData `interface`
 * This interface contains the data to build an embed.
 */
export interface ODEmbedData {
    /**The title of the embed */
    title: string | null;
    /**The color of the embed */
    color: discord.ColorResolvable | string | null;
    /**The url of the embed */
    url: string | null;
    /**The description of the embed */
    description: string | null;
    /**The author text of the embed */
    authorText: string | null;
    /**The author image of the embed */
    authorImage: string | null;
    /**The author url of the embed */
    authorUrl: string | null;
    /**The footer text of the embed */
    footerText: string | null;
    /**The footer image of the embed */
    footerImage: string | null;
    /**The image of the embed */
    image: string | null;
    /**The thumbnail of the embed */
    thumbnail: string | null;
    /**The fields of the embed */
    fields: ODInterfaceWithPartialProperty<discord.EmbedField, "inline">[];
    /**The timestamp of the embed */
    timestamp: number | Date | null;
}
/**## ODEmbedBuildResult `interface`
 * This interface contains the result from a built embed. This can be used in the `ODMessage` builder!
 */
export interface ODEmbedBuildResult {
    /**The id of this embed */
    id: ODId;
    /**The discord embed */
    embed: discord.EmbedBuilder | null;
}
/**## ODEmbedInstance `class`
 * This is an Open Ticket embed instance.
 *
 * It contains all properties & functions to build an embed!
 */
export declare class ODEmbedInstance {
    /**The current data of this embed */
    data: ODEmbedData;
    /**Set the title of this embed */
    setTitle(title: ODEmbedData["title"]): this;
    /**Set the color of this embed */
    setColor(color: ODEmbedData["color"]): this;
    /**Set the url of this embed */
    setUrl(url: ODEmbedData["url"]): this;
    /**Set the description of this embed */
    setDescription(description: ODEmbedData["description"]): this;
    /**Set the author of this embed */
    setAuthor(text: ODEmbedData["authorText"], image?: ODEmbedData["authorImage"], url?: ODEmbedData["authorUrl"]): this;
    /**Set the footer of this embed */
    setFooter(text: ODEmbedData["footerText"], image?: ODEmbedData["footerImage"]): this;
    /**Set the image of this embed */
    setImage(image: ODEmbedData["image"]): this;
    /**Set the thumbnail of this embed */
    setThumbnail(thumbnail: ODEmbedData["thumbnail"]): this;
    /**Set the fields of this embed */
    setFields(fields: ODEmbedData["fields"]): this;
    /**Add fields to this embed */
    addFields(...fields: ODEmbedData["fields"]): this;
    /**Clear all fields from this embed */
    clearFields(): this;
    /**Set the timestamp of this embed */
    setTimestamp(timestamp: ODEmbedData["timestamp"]): this;
}
/**## ODEmbed `class`
 * This is an Open Ticket embed builder.
 *
 * With this class, you can create a embed to use in a message.
 * The only difference with normal embeds is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
export declare class ODEmbed<Source extends string, Params> extends ODBuilderImplementation<ODEmbedInstance, Source, Params, ODEmbedBuildResult> {
    /**Build this embed & compile it for discord.js */
    build(source: Source, params: Params): Promise<ODEmbedBuildResult>;
}
/**## ODQuickEmbed `class`
 * This is an Open Ticket quick embed builder.
 *
 * With this class, you can quickly create a embed to use in a message.
 * This quick embed can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these embeds are less customisable by other plugins.
 */
export declare class ODQuickEmbed {
    /**The id of this embed. */
    id: ODId;
    /**The current data of this embed */
    data: Partial<ODEmbedData>;
    constructor(id: ODValidId, data: Partial<ODEmbedData>);
    /**Build this embed & compile it for discord.js */
    build(): Promise<ODEmbedBuildResult>;
}
/**## ODMessageManager `class`
 * This is an Open Ticket message manager.
 *
 * It contains all Open Ticket message builders. Here, you can add your own messages or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
export declare class ODMessageManager extends ODManagerWithSafety<ODMessage<string, any>> {
    constructor(debug: ODDebugger);
}
/**## ODMessageData `interface`
 * This interface contains the data to build a message.
 */
export interface ODMessageData {
    /**The content of this message. `null` when no content */
    content: string | null;
    /**Poll data for this message */
    poll: discord.PollData | null;
    /**Try to make this message ephemeral when available */
    ephemeral: boolean;
    /**Embeds from this message */
    embeds: ODEmbedBuildResult[];
    /**Components from this message */
    components: ODComponentBuildResult[];
    /**Files from this message */
    files: ODFileBuildResult[];
    /**Additional options that aren't covered by the Open Ticket api!*/
    additionalOptions: Omit<discord.MessageCreateOptions, "poll" | "content" | "embeds" | "components" | "files" | "flags">;
}
/**## ODMessageBuildResult `interface`
 * This interface contains the result from a built message. This can be sent in a discord channel!
 */
export interface ODMessageBuildResult {
    /**The id of this message */
    id: ODId;
    /**The discord message */
    message: Omit<discord.MessageCreateOptions, "flags">;
    /**When enabled, the bot will try to send this as an ephemeral message */
    ephemeral: boolean;
}
/**## ODMessageBuildSentResult `interface`
 * This interface contains the result from a sent built message. This can be used to edit, view & save the message that got created.
 */
export interface ODMessageBuildSentResult<InGuild extends boolean> {
    /**Did the message get sent successfully? */
    success: boolean;
    /**The message that got sent. */
    message: discord.Message<InGuild> | null;
}
/**## ODMessageInstance `class`
 * This is an Open Ticket message instance.
 *
 * It contains all properties & functions to build a message!
 */
export declare class ODMessageInstance {
    /**The current data of this message */
    data: ODMessageData;
    /**Set the content of this message */
    setContent(content: ODMessageData["content"]): this;
    /**Set the poll of this message */
    setPoll(poll: ODMessageData["poll"]): this;
    /**Make this message ephemeral when possible */
    setEphemeral(ephemeral: ODMessageData["ephemeral"]): this;
    /**Set the embeds of this message */
    setEmbeds(...embeds: ODEmbedBuildResult[]): this;
    /**Add an embed to this message! */
    addEmbed(embed: ODEmbedBuildResult): this;
    /**Remove an embed from this message */
    removeEmbed(id: ODValidId): this;
    /**Get an embed from this message */
    getEmbed(id: ODValidId): discord.EmbedBuilder | null;
    /**Set the components of this message */
    setComponents(...components: ODComponentBuildResult[]): this;
    /**Add a component to this message! */
    addComponent(component: ODComponentBuildResult): this;
    /**Remove a component from this message */
    removeComponent(id: ODValidId): this;
    /**Get a component from this message */
    getComponent(id: ODValidId): "\n" | discord.MessageActionRowComponentBuilder | null;
    /**Set the files of this message */
    setFiles(...files: ODFileBuildResult[]): this;
    /**Add a file to this message! */
    addFile(file: ODFileBuildResult): this;
    /**Remove a file from this message */
    removeFile(id: ODValidId): this;
    /**Get a file from this message */
    getFile(id: ODValidId): discord.AttachmentBuilder | null;
}
/**## ODMessage `class`
 * This is an Open Ticket message builder.
 *
 * With this class, you can create a message to send in a discord channel.
 * The only difference with normal messages is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
export declare class ODMessage<Source extends string, Params> extends ODBuilderImplementation<ODMessageInstance, Source, Params, ODMessageBuildResult> {
    /**Build this message & compile it for discord.js */
    build(source: Source, params: Params): Promise<ODMessageBuildResult>;
}
/**## ODQuickMessage `class`
 * This is an Open Ticket quick message builder.
 *
 * With this class, you can quickly create a message to send in a discord channel.
 * This quick message can be used by Open Ticket plugins instead of the normal builders to speed up the process!
 *
 * Because of the quick functionality, these messages are less customisable by other plugins.
 */
export declare class ODQuickMessage {
    /**The id of this message. */
    id: ODId;
    /**The current data of this message. */
    data: Partial<ODMessageData>;
    constructor(id: ODValidId, data: Partial<ODMessageData>);
    /**Build this message & compile it for discord.js */
    build(): Promise<ODMessageBuildResult>;
}
/**## ODModalManager `class`
 * This is an Open Ticket modal manager.
 *
 * It contains all Open Ticket modal builders. Here, you can add your own modals or edit existing ones!
 *
 * It's recommended to use this system in combination with all the other Open Ticket builders!
 */
export declare class ODModalManager extends ODManagerWithSafety<ODModal<string, any>> {
    constructor(debug: ODDebugger);
}
/**## ODModalDataQuestion `interface`
 * This interface contains the data to build a modal question.
 */
export interface ODModalDataQuestion {
    /**The style of this modal question */
    style: "short" | "paragraph";
    /**The custom id of this modal question */
    customId: string;
    /**The label of this modal question */
    label?: string;
    /**The min length of this modal question */
    minLength?: number;
    /**The max length of this modal question */
    maxLength?: number;
    /**Is this modal question required? */
    required?: boolean;
    /**The placeholder of this modal question */
    placeholder?: string;
    /**The initial value of this modal question */
    value?: string;
}
/**## ODModalData `interface`
 * This interface contains the data to build a modal.
 */
export interface ODModalData {
    /**The custom id of this modal */
    customId: string;
    /**The title of this modal */
    title: string | null;
    /**The collection of questions in this modal */
    questions: ODModalDataQuestion[];
}
/**## ODModalBuildResult `interface`
 * This interface contains the result from a built modal (form). This can be used in the `ODMessage` builder!
 */
export interface ODModalBuildResult {
    /**The id of this modal */
    id: ODId;
    /**The discord modal */
    modal: discord.ModalBuilder;
}
/**## ODModalInstance `class`
 * This is an Open Ticket modal instance.
 *
 * It contains all properties & functions to build a modal!
 */
export declare class ODModalInstance {
    /**The current data of this modal */
    data: ODModalData;
    /**Set the custom id of this modal */
    setCustomId(customId: ODModalData["customId"]): this;
    /**Set the title of this modal */
    setTitle(title: ODModalData["title"]): this;
    /**Set the questions of this modal */
    setQuestions(...questions: ODModalData["questions"]): this;
    /**Add a question to this modal! */
    addQuestion(question: ODModalDataQuestion): this;
    /**Remove a question from this modal */
    removeQuestion(customId: string): this;
    /**Get a question from this modal */
    getQuestion(customId: string): ODModalDataQuestion | null;
}
/**## ODModal `class`
 * This is an Open Ticket modal builder.
 *
 * With this class, you can create a modal to use as response in interactions.
 * The only difference with normal modals is that this one can be edited by Open Ticket plugins!
 *
 * This is possible by using "workers" or multiple functions that will be executed in priority order!
 */
export declare class ODModal<Source extends string, Params> extends ODBuilderImplementation<ODModalInstance, Source, Params, ODModalBuildResult> {
    /**Build this modal & compile it for discord.js */
    build(source: Source, params: Params): Promise<ODModalBuildResult>;
}
