import type { ActionHandler, ActionContext } from './ActionHandler';

export class ActionRegistry {
  private readonly handlers = new Map<string, ActionHandler>();

  register(handler: ActionHandler) {
    this.handlers.set(handler.name, handler);
  }

  async execute(actionName: string, ctx: ActionContext) {
    const handler = this.handlers.get(actionName);
    if (!handler) {
      throw new Error(`Action not registered: ${actionName}`);
    }
    return handler.execute(ctx);
  }
}