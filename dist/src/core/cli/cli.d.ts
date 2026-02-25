/**A utility function to center text to a certain width. */
export declare function centerText(text: string, width: number): string;
/**A utility function to terminate the interactive CLI. */
export declare function terminate(): Promise<void>;
/**Render the header of the interactive CLI. */
export declare function renderHeader(path: (string | number)[] | string): void;
export declare function execute(): Promise<void>;
