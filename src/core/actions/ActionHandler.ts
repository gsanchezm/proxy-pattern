export interface ActionContext {
    selector: string;
    args: unknown[];
  
    // Telemetry context (keeps your current logs consistent)
    locatorFile?: string;
    locatorKey?: string;
    action?: string;
  }
  
  export interface ActionHandler {
    readonly name: string;
    execute(ctx: ActionContext): Promise<unknown>;
  }  